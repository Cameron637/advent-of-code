#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { type Coordinate, toCoordinate } from '../../util/util';

interface Path {
  position: Coordinate;
  sequence: string[];
  visited: Set<string>;
}

function enter(keypad: string[], code: string): string[] {
  let combinations: string[] = [];
  let start = toCoordinate(keypad[0].length, keypad.join('').indexOf('A'));

  code.split('').forEach((button) => {
    let sequences: string[] = [];

    let paths: Path[] = [
      { position: start, sequence: [], visited: new Set([' ']) },
    ];

    while (paths.length) {
      const newPaths: Path[] = [];

      paths.forEach((path) => {
        if (keypad[path.position[0]][path.position[1]] === button) {
          start = path.position;
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

    combinations = combinations.length
      ? combinations.flatMap((combination) =>
          sequences.map((sequence) => `${combination}${sequence}`),
        )
      : sequences;
  });

  return combinations;
}

function extractNumeric(code: string): number {
  return parseInt(code.replaceAll(/\D/g, ''), 10);
}

function calculateComplexity(keypads: string[][], code: string): number {
  const shortestSequences = keypads.reduce(
    (sequences, keypad) => {
      const newSequences = sequences.flatMap((sequence) =>
        enter(keypad, sequence),
      );

      const newShortest = newSequences.reduce(
        (shortest, current) =>
          current.length < shortest ? current.length : shortest,
        Number.POSITIVE_INFINITY,
      );

      return newSequences.filter(({ length }) => length === newShortest);
    },
    [code],
  );

  return shortestSequences[0].length * extractNumeric(code);
}

function sumComplexities(keypads: string[][], codes: string[]): number {
  return codes.reduce(
    (sum, code) => sum + calculateComplexity(keypads, code),
    0,
  );
}

const numericKeypad = ['789', '456', '123', ' 0A'];
const directionalKeypad = [' ^A', '<v>'];
const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const codes = input.split('\n');

console.log(
  sumComplexities([numericKeypad, directionalKeypad, directionalKeypad], codes),
);

const directionals = Array.from<string[]>({ length: 25 }).fill(
  directionalKeypad,
);

console.log(sumComplexities([numericKeypad, ...directionals], codes));
