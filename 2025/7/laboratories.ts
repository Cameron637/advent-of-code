#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

function getManifold(input: string): string[][] {
  return input.split('\n').map((line) => line.split(''));
}

function countBeamSplits(manifold: string[][]): number {
  const beams: [number, number][] = [[0, manifold[0].indexOf('S')]];
  const visited = new Set<string>();
  let splits = 0;

  while (beams.length) {
    const [startRow, col] = beams.pop()!;
    let row = startRow;

    while (row < manifold.length && manifold[row][col] !== '^') {
      row++;
    }

    if (row < manifold.length) {
      const splitterPosition = `${row},${col}`;

      if (!visited.has(splitterPosition)) {
        visited.add(splitterPosition);
        splits++;

        if (col > 0) {
          beams.push([row + 1, col - 1]);
        }

        if (col < manifold[0].length - 1) {
          beams.push([row + 1, col + 1]);
        }
      }
    }
  }

  return splits;
}

function countTimelines(manifold: string[][]): number {
  const memo = new Map<string, number>();

  function countPaths(row: number, col: number): number {
    const key = `${row},${col}`;

    if (memo.has(key)) {
      return memo.get(key)!;
    }

    if (col < 0 || col >= manifold[0].length) {
      memo.set(key, 0);
      return 0;
    }

    if (row >= manifold.length) {
      memo.set(key, 1);
      return 1;
    }

    let currentRow = row;
    while (currentRow < manifold.length && manifold[currentRow][col] !== '^') {
      currentRow++;
    }

    if (currentRow >= manifold.length) {
      memo.set(key, 1);
      return 1;
    }

    let totalPaths = 0;
    totalPaths += countPaths(currentRow + 1, col - 1);
    totalPaths += countPaths(currentRow + 1, col + 1);
    memo.set(key, totalPaths);
    return totalPaths;
  }

  const startCol = manifold[0].indexOf('S');
  return countPaths(0, startCol);
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8').trim();
const manifold = getManifold(input);
console.log(countBeamSplits(manifold));
console.log(countTimelines(manifold));
