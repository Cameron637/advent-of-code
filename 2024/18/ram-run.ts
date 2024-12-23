#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { type Coordinate } from '../../util/util';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

function getBytes(limit = Number.POSITIVE_INFINITY): Coordinate[] {
  return input
    .split('\n')
    .slice(0, limit)
    .map((line) => {
      const [row, col] = line.split(',').map((value) => parseInt(value, 10));
      return [row, col];
    });
}

function getGrid(bytes: Coordinate[], size: [number, number]): number[][] {
  const grid = Array.from({ length: size[0] }, () =>
    Array.from<number>({ length: size[1] }).fill(-1),
  );

  bytes.forEach((byte) => {
    grid[byte[0]][byte[1]] = Number.POSITIVE_INFINITY;
  });

  return grid;
}

function simulate(bytes: Coordinate[], size: [number, number]): number {
  const grid = getGrid(bytes, size);
  const start: Coordinate = [0, 0];
  grid[start[0]][start[1]] = 0;
  let queue: Coordinate[] = [start];

  while (queue.length) {
    const newQueue: Coordinate[] = [];

    queue.forEach(([row, col]) => {
      if (row > 0 && grid[row - 1][col] === -1) {
        grid[row - 1][col] = grid[row][col] + 1;
        newQueue.push([row - 1, col]);
      }

      if (row < grid.length - 1 && grid[row + 1][col] === -1) {
        grid[row + 1][col] = grid[row][col] + 1;
        newQueue.push([row + 1, col]);
      }

      if (col > 0 && grid[row][col - 1] === -1) {
        grid[row][col - 1] = grid[row][col] + 1;
        newQueue.push([row, col - 1]);
      }

      if (col < grid[0].length - 1 && grid[row][col + 1] === -1) {
        grid[row][col + 1] = grid[row][col] + 1;
        newQueue.push([row, col + 1]);
      }
    });

    queue = newQueue;
  }

  return grid[grid.length - 1][grid[0].length - 1];
}

console.log(simulate(getBytes(1024), [71, 71]));

let limit = 1025;
let bytes = getBytes(limit);

while (simulate(bytes, [71, 71]) !== -1) {
  bytes = getBytes(++limit);
}

console.log(bytes[bytes.length - 1].join(','));
