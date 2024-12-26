#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { type Coordinate, toCoordinate } from '../../util/util';

interface Path {
  position: Coordinate;
  sequence: string[];
  visited: Set<string>;
}

function getOptimalSequences(keypad: string[]): Record<string, string[]> {
  const buttons = keypad.join('').replace(' ', '').split('');
  const pairs = new Set<string>();

  buttons.forEach((a) => {
    buttons.forEach((b) => {
      pairs.add(`${a}-${b}`);
      pairs.add(`${b}-${a}`);
    });
  });

  const pairTuples = [...pairs].map((pair) => pair.split('-'));

  return pairTuples.reduce(
    (optimalSequences: Record<string, string[]>, [a, b]) => {
      const start = toCoordinate(keypad[0].length, keypad.join('').indexOf(a));
      let sequences: string[] = [];

      let paths: Path[] = [
        { position: start, sequence: [], visited: new Set([' ']) },
      ];

      while (paths.length) {
        const newPaths: Path[] = [];

        paths.forEach((path) => {
          if (keypad[path.position[0]][path.position[1]] === b) {
            const newSequence = [...path.sequence, 'A'].join('');

            if (!sequences.length || newSequence.length < sequences[0].length) {
              sequences = [newSequence];
            } else if (newSequence.length === sequences[0].length) {
              sequences.push(newSequence);
            }
          }

          const [row, col] = path.position;

          if (row > 0 && !path.visited.has(keypad[row - 1][col])) {
            newPaths.push({
              position: [row - 1, col],
              sequence: [...path.sequence, '^'],
              visited: new Set([...path.visited, keypad[row][col]]),
            });
          }

          if (
            row < keypad.length - 1 &&
            !path.visited.has(keypad[row + 1][col])
          ) {
            newPaths.push({
              position: [row + 1, col],
              sequence: [...path.sequence, 'v'],
              visited: new Set([...path.visited, keypad[row][col]]),
            });
          }

          if (col > 0 && !path.visited.has(keypad[row][col - 1])) {
            newPaths.push({
              position: [row, col - 1],
              sequence: [...path.sequence, '<'],
              visited: new Set([...path.visited, keypad[row][col]]),
            });
          }

          if (
            col < keypad[0].length - 1 &&
            !path.visited.has(keypad[row][col + 1])
          ) {
            newPaths.push({
              position: [row, col + 1],
              sequence: [...path.sequence, '>'],
              visited: new Set([...path.visited, keypad[row][col]]),
            });
          }
        });

        paths = newPaths;
      }

      optimalSequences[`${a}-${b}`] = sequences.filter((sequence) => {
        let direction = sequence[0];
        let turned = false;

        for (const character of sequence.slice(0, sequence.length - 1)) {
          if (character !== direction && turned) {
            return false;
          } else if (character !== direction) {
            direction = character;
            turned = true;
          }
        }

        return true;
      });

      return optimalSequences;
    },
    {},
  );
}

interface Robot {
  cache: Record<string, number>;
  key: string;
  keypad: Record<string, string[]>;
}

function createRobot(keypad: Record<string, string[]>): Robot {
  return {
    cache: {},
    key: 'A',
    keypad,
  };
}

interface ChainParams {
  indirection: number;
  keypads: {
    directional: Record<string, string[]>;
    numeric: Record<string, string[]>;
  };
}

function createChain({ keypads, indirection }: ChainParams): Robot[] {
  return [
    createRobot(keypads.numeric),
    ...Array.from<unknown, Robot>({ length: indirection }, () =>
      createRobot(keypads.directional),
    ),
  ];
}

function calculateCost(robots: Robot[], code: string): number {
  const [robot, ...remaining] = robots;

  return code.split('').reduce((costSoFar, button) => {
    const cacheKey = `${robot.key}-${button}`;
    robot.key = button;

    if (robot.cache[cacheKey]) {
      return costSoFar + robot.cache[cacheKey];
    }

    const sequences = robot.keypad[cacheKey];

    const cost = remaining.length
      ? Math.min(
          ...sequences.map((sequence) => calculateCost(remaining, sequence)),
        )
      : sequences[0].length;

    robot.cache[cacheKey] = cost;
    return costSoFar + cost;
  }, 0);
}

function extractNumeric(code: string): number {
  return parseInt(code.replaceAll(/\D/g, ''), 10);
}

function calculateComplexity(robots: Robot[], code: string): number {
  return calculateCost(robots, code) * extractNumeric(code);
}

function sumComplexities(robots: Robot[], codes: string[]): number {
  return codes.reduce(
    (sum, code) => sum + calculateComplexity(robots, code),
    0,
  );
}

const keypads = {
  directional: getOptimalSequences([' ^A', '<v>']),
  numeric: getOptimalSequences(['789', '456', '123', ' 0A']),
};

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const codes = input.split('\n');
const chain = createChain({ indirection: 2, keypads });
console.log(sumComplexities(chain, codes));
console.log(sumComplexities(createChain({ indirection: 25, keypads }), codes));
