#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const rows = input.split('\n');
const grid = rows.map((row) => row.split(''));

function xmasSearch(): number {
  const columns = rows.reduce(
    (columnBuilders, row) => {
      const characters = row.split('');

      return columnBuilders.map(
        (column, index) => `${column}${characters[index]}`,
      );
    },
    Array.from<string>({ length: rows[0].length }).fill(''),
  );

  const numDiagonals = rows.length + columns.length - 1;

  const topLeftDiagonals = Array.from<string>({ length: numDiagonals }).fill(
    '',
  );

  const topRightDiagonals = Array.from<string>({ length: numDiagonals }).fill(
    '',
  );

  for (let i = 0; i < columns.length; i++) {
    for (let j = 0; j < rows.length; j++) {
      topLeftDiagonals[i + j] = `${topLeftDiagonals[i + j]}${grid[j][i]}`;
    }
  }

  for (let i = 0; i < columns.length; i++) {
    for (let j = rows.length - 1; j >= 0; j--) {
      const diagonalIndex = i + Math.abs(rows.length - 1 - j);

      topRightDiagonals[diagonalIndex] =
        `${topRightDiagonals[diagonalIndex]}${grid[j][i]}`;
    }
  }

  return [
    ...rows,
    ...columns,
    ...topLeftDiagonals,
    ...topRightDiagonals,
  ].reduce(
    (count, line) =>
      count + [...line.matchAll(/XMAS/g), ...line.matchAll(/SAMX/g)].length,
    0,
  );
}

function xMasSearch(): number {
  let count = 0;

  for (let i = 1; i < rows.length - 1; i++) {
    for (let j = 1; j < grid[0].length - 1; j++) {
      if (
        grid[i][j] === 'A' &&
        /MAS|SAM/.test(
          `${grid[i - 1][j - 1]}${grid[i][j]}${grid[i + 1][j + 1]}`,
        ) &&
        /MAS|SAM/.test(
          `${grid[i - 1][j + 1]}${grid[i][j]}${grid[i + 1][j - 1]}`,
        )
      ) {
        count++;
      }
    }
  }

  return count;
}

console.log(xmasSearch());
console.log(xMasSearch());
