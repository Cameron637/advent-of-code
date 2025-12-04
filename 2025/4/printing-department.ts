#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

function isAccessible(diagram: string[][], [i, j]: [number, number]): boolean {
  const row = diagram[i];
  let adjacent = 0;

  if (i > 0 && j > 0 && diagram[i - 1][j - 1] === '@') {
    adjacent++;
  }

  if (i > 0 && diagram[i - 1][j] === '@') {
    adjacent++;
  }

  if (i > 0 && j < row.length - 1 && diagram[i - 1][j + 1] === '@') {
    adjacent++;
  }

  if (j > 0 && diagram[i][j - 1] === '@') {
    adjacent++;
  }

  if (j < row.length - 1 && diagram[i][j + 1] === '@') {
    adjacent++;
  }

  if (i < diagram.length - 1 && j > 0 && diagram[i + 1][j - 1] === '@') {
    adjacent++;
  }

  if (i < diagram.length - 1 && diagram[i + 1][j] === '@') {
    adjacent++;
  }

  if (
    i < diagram.length - 1 &&
    j < row.length - 1 &&
    diagram[i + 1][j + 1] === '@'
  ) {
    adjacent++;
  }

  return adjacent < 4;
}

function getAccessibleRolls(diagram: string[][]): [number, string[][]] {
  let accessibleRolls = 0;
  const newDiagram = [...diagram.map((row) => [...row])];

  for (let i = 0; i < diagram.length; i++) {
    const row = diagram[i];

    for (let j = 0; j < row.length; j++) {
      if (diagram[i][j] !== '@') {
        continue;
      }

      if (isAccessible(diagram, [i, j])) {
        accessibleRolls++;
        newDiagram[i][j] = 'x';
      }
    }
  }

  return [accessibleRolls, newDiagram];
}

function countTotalRemovableRolls(diagram: string[][]): number {
  let current = diagram;
  let [count, updated] = getAccessibleRolls(diagram);
  let totalRemovableRolls = count;

  while (JSON.stringify(current) !== JSON.stringify(updated)) {
    current = updated;
    const [newCount, newUpdated] = getAccessibleRolls(current);
    count = newCount;
    updated = newUpdated;
    totalRemovableRolls += count;
  }

  return totalRemovableRolls;
}

const diagram = readFileSync(resolve(__dirname, 'input'), 'utf-8')
  .trim()
  .split('\n')
  .map((line) => line.split(''));

console.log(getAccessibleRolls(diagram)[0]);
console.log(countTotalRemovableRolls(diagram));
