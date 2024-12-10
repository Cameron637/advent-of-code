#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { type Coordinate, toCoordinate } from '../../util/util';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const map = input.split('\n').map((row) => row.split(''));

const trailheads = [...input.replaceAll('\n', '').matchAll(/0/g)].map(
  ({ index }) => toCoordinate(map[0].length, index),
);

function isPath(
  [startRow, startCol]: Coordinate,
  [endRow, endCol]: Coordinate,
): boolean {
  return (
    parseInt(map[endRow][endCol], 10) -
      parseInt(map[startRow][startCol], 10) ===
    1
  );
}

function getPaths(start: Coordinate): Coordinate[] {
  const paths: Coordinate[] = [];
  const [row, col] = start;

  const [up, down, left, right]: Coordinate[] = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];

  if (row - 1 >= 0 && isPath(start, up)) {
    paths.push(up);
  }

  if (row + 1 < map.length && isPath(start, down)) {
    paths.push(down);
  }

  if (col - 1 >= 0 && isPath(start, left)) {
    paths.push(left);
  }

  if (col + 1 < map[0].length && isPath(start, right)) {
    paths.push(right);
  }

  return paths;
}

function rateTrails(start: Coordinate, countDistinct = false): number {
  let score = 0;
  const unexplored = getPaths(start);
  const visited = new Set<string>();

  while (unexplored.length) {
    const [row, col] = unexplored.pop() ?? [0, 0];
    const id = `${row},${col}`;

    if ((countDistinct || !visited.has(id)) && map[row][col] === '9') {
      score++;
    } else {
      unexplored.push(...getPaths([row, col]));
    }

    visited.add(id);
  }

  return score;
}

const scoreSum = trailheads.reduce(
  (sum, trailhead) => sum + rateTrails(trailhead),
  0,
);

console.log(scoreSum);

const ratingSum = trailheads.reduce(
  (sum, trailhead) => sum + rateTrails(trailhead, true),
  0,
);

console.log(ratingSum);
