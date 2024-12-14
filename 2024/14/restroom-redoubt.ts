#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Coordinate } from '../../util/util';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

function wrap(max: number, x: number) {
  return ((x % max) + max) % max;
}

interface Robot {
  position: Coordinate;
  velocity: Coordinate;
}

interface Room {
  height: number;
  width: number;
}

interface GetPositionsParams {
  robots: Robot[];
  room: Room;
  seconds: number;
}

function getPositions({
  robots,
  room: { height, width },
  seconds,
}: GetPositionsParams): Coordinate[] {
  return robots.map(({ position, velocity }) => {
    return [
      wrap(width, position[0] + velocity[0] * seconds),
      wrap(height, position[1] + velocity[1] * seconds),
    ];
  });
}

interface SafetyFactorParams {
  positions: Coordinate[];
  room: Room;
}

function calculateSafetyFactor({
  positions,
  room: { height, width },
}: SafetyFactorParams): number {
  const safeRow = Math.floor(height / 2);
  const safeCol = Math.floor(width / 2);

  const quadrants: [number, number, number, number] = positions.reduce(
    (quads, [x, y]) => {
      if (x < safeCol && y < safeRow) {
        quads[0]++;
      } else if (x > safeCol && y < safeRow) {
        quads[1]++;
      } else if (x < safeCol && y > safeRow) {
        quads[2]++;
      } else if (x > safeCol && y > safeRow) {
        quads[3]++;
      }

      return quads;
    },
    [0, 0, 0, 0],
  );

  return quadrants.reduce(
    (safetyFactor, quadrant) => safetyFactor * quadrant,
    1,
  );
}

function calculateHypotenuse(side1: number, side2: number): number {
  return Math.sqrt(side1 ** 2 + side2 ** 2);
}

interface FindEasterEggParams {
  robots: Robot[];
  room: Room;
}

interface AverageDistanceRecord {
  average: number;
  seconds: number;
}

function findEasterEgg({ robots, room }: FindEasterEggParams): number {
  let seconds = 0;
  let cycled = false;
  const seen = new Set<string>();
  const averages: AverageDistanceRecord[] = [];

  while (!cycled) {
    const positions = getPositions({ robots, room, seconds });
    const key = JSON.stringify(positions);

    const distances = positions.map((position, index) => {
      const nextIndex = index < positions.length - 1 ? index + 1 : 0;
      const next = positions[nextIndex];
      return calculateHypotenuse(position[0] - next[0], position[1] - next[1]);
    });

    const average =
      distances.reduce((sum, distance) => sum + distance, 0) / positions.length;

    averages.push({ average, seconds });

    if (seen.has(key)) {
      cycled = true;
    } else {
      seen.add(JSON.stringify(positions));
      seconds++;
    }
  }

  const closest = averages.reduce((min, current) =>
    !min || current.average < min.average ? current : min,
  );

  return closest.seconds;
}

const robots: Robot[] = input.split('\n').map((line) => {
  const [px, py, vx, vy] = [...line.matchAll(/-?(\d+)/g)].map((match) => {
    const num = parseInt(match[1], 10);
    return match[0].startsWith('-') ? -1 * num : num;
  });

  return {
    position: [px, py],
    velocity: [vx, vy],
  };
});

const room = { height: 103, width: 101 };
const positions = getPositions({ robots, room, seconds: 100 });
console.log(calculateSafetyFactor({ positions, room }));
console.log(findEasterEgg({ robots, room }));
