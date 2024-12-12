#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { toIndex, type Coordinate } from '../../util/util';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

interface Plot {
  coordinate: Coordinate;
  plant: string;
  region?: string;
}

const garden: Plot[] = input
  .split('\n')
  .flatMap((line, row) =>
    line.split('').map((plant, col) => ({ coordinate: [row, col], plant })),
  );

const [rows, columns] = garden[garden.length - 1].coordinate.map(
  (num) => num + 1,
);

const incrementIds: Record<string, number> = {};
let start = garden.find(({ region }) => !region);

while (start) {
  if (incrementIds[start.plant]) {
    start.region = `${start.plant}${incrementIds[start.plant]}`;
    incrementIds[start.plant]++;
  } else {
    incrementIds[start.plant] = 1;
    start.region = `${start.plant}0`;
  }

  const stack = [start];
  const visited = new Set<string>();

  while (stack.length) {
    const plot = stack.pop() ?? { coordinate: [0, 0], plant: '' };
    const [row, col] = plot.coordinate;
    const plotId = `${row},${col}`;

    if (plot.plant === start.plant && !visited.has(plotId)) {
      plot.region = start.region;

      if (row > 0) {
        stack.push(garden[toIndex(columns, [row - 1, col])]);
      }

      if (col > 0) {
        stack.push(garden[toIndex(columns, [row, col - 1])]);
      }

      if (row < rows - 1) {
        stack.push(garden[toIndex(columns, [row + 1, col])]);
      }

      if (col < columns - 1) {
        stack.push(garden[toIndex(columns, [row, col + 1])]);
      }

      visited.add(plotId);
    }
  }

  start = garden.find(({ region }) => !region);
}

const regionIds = [...new Set(garden.map(({ region }) => region ?? ''))];

const [totalPrice, totalBulk] = regionIds.reduce(
  ([price, bulk]: [number, number], id) => {
    const region = garden.filter((plot) => plot.region === id);

    const [totalPerimeter, sidesMap] = region.reduce(
      ([perimeter, sides]: [number, Record<string, number[]>], plot) => {
        let edges = 0;
        const [row, col] = plot.coordinate;

        if (
          row === 0 ||
          garden[toIndex(columns, [row - 1, col])].plant !== plot.plant
        ) {
          edges++;
          const boundary = `row-boundary-${row}-${row - 1}`;
          sides[boundary] = sides[boundary] ? [...sides[boundary], col] : [col];
        }

        if (
          col === 0 ||
          garden[toIndex(columns, [row, col - 1])].plant !== plot.plant
        ) {
          edges++;
          const boundary = `col-boundary-${col}-${col - 1}`;
          sides[boundary] = sides[boundary] ? [...sides[boundary], row] : [row];
        }

        if (
          row === rows - 1 ||
          garden[toIndex(columns, [row + 1, col])].plant !== plot.plant
        ) {
          edges++;
          const boundary = `row-boundary-${row}-${row + 1}`;
          sides[boundary] = sides[boundary] ? [...sides[boundary], col] : [col];
        }

        if (
          col === columns - 1 ||
          garden[toIndex(columns, [row, col + 1])].plant !== plot.plant
        ) {
          edges++;
          const boundary = `col-boundary-${col}-${col + 1}`;
          sides[boundary] = sides[boundary] ? [...sides[boundary], row] : [row];
        }

        return [perimeter + edges, sides];
      },
      [0, {}],
    );

    const totalSides = Object.values(sidesMap).reduce((sides, side) => {
      let newSides = 1;

      for (let i = 0; i < side.length - 1; i++) {
        if (side[i] + 1 !== side[i + 1]) {
          newSides++;
        }
      }

      return sides + newSides;
    }, 0);

    return [
      price + region.length * totalPerimeter,
      bulk + region.length * totalSides,
    ];
  },
  [0, 0],
);

console.log(totalPrice);
console.log(totalBulk);
