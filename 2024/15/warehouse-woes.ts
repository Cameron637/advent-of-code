#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Coordinate, toCoordinate } from '../../util/util';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const [warehouseString, movesString] = input.split('\n\n');
const warehouse = warehouseString.split('\n').map((line) => line.split(''));
const moves = movesString.replaceAll('\n', '').split('');

const doubleWide = warehouse.map((tiles) =>
  tiles.flatMap((tile) => {
    if (tile === 'O') {
      return ['[', ']'];
    } else if (tile === '@') {
      return [tile, '.'];
    }

    return [tile, tile];
  }),
);

let robot = toCoordinate(
  warehouse[0].length,
  warehouseString.replaceAll('\n', '').indexOf('@'),
);

moves.forEach((move) => {
  const [row, col] = robot;
  let moved = false;

  if (move === '^') {
    const affectedSpaces: Coordinate[] = [robot];
    let i = row;

    while (warehouse[i - 1][col] === 'O') {
      affectedSpaces.push([i - 1, col]);
      i--;
    }

    if (warehouse[i - 1][col] === '.') {
      while (i <= row) {
        const replacement = affectedSpaces[row - i];
        warehouse[i - 1][col] = warehouse[replacement[0]][replacement[1]];
        i++;
      }

      robot = [row - 1, col];
      moved = true;
    }
  } else if (move === 'v') {
    const affectedSpaces: Coordinate[] = [robot];
    let i = row;

    while (warehouse[i + 1][col] === 'O') {
      affectedSpaces.push([i + 1, col]);
      i++;
    }

    if (warehouse[i + 1][col] === '.') {
      while (i >= row) {
        const replacement = affectedSpaces[i - row];
        warehouse[i + 1][col] = warehouse[replacement[0]][replacement[1]];
        i--;
      }

      robot = [row + 1, col];
      moved = true;
    }
  } else if (move === '<') {
    const affectedSpaces: Coordinate[] = [robot];
    let i = col;

    while (warehouse[row][i - 1] === 'O') {
      affectedSpaces.push([row, i - 1]);
      i--;
    }

    if (warehouse[row][i - 1] === '.') {
      while (i <= col) {
        const replacement = affectedSpaces[col - i];
        warehouse[row][i - 1] = warehouse[replacement[0]][replacement[1]];
        i++;
      }

      robot = [row, col - 1];
      moved = true;
    }
  } else if (move === '>') {
    const affectedSpaces: Coordinate[] = [robot];
    let i = col;

    while (warehouse[row][i + 1] === 'O') {
      affectedSpaces.push([row, i + 1]);
      i++;
    }

    if (warehouse[row][i + 1] === '.') {
      while (i >= col) {
        const replacement = affectedSpaces[i - col];
        warehouse[row][i + 1] = warehouse[replacement[0]][replacement[1]];
        i--;
      }

      robot = [row, col + 1];
      moved = true;
    }
  }

  warehouse[row][col] = moved ? '.' : '@';
});

const boxes = [
  ...warehouse
    .map((row) => row.join(''))
    .join('')
    .matchAll(/O/g),
].map((match) => toCoordinate(warehouse[0].length, match.index));

const gpsSum = boxes.reduce((sum, [row, col]) => (sum += 100 * row + col), 0);
console.log(gpsSum);

const robotRow = doubleWide.findIndex((row) => row.includes('@'));
robot = [robotRow, doubleWide[robotRow].indexOf('@')];

moves.forEach((move) => {
  const [row, col] = robot;

  if (move === '^') {
    const affectedLayers: Record<string, Coordinate>[] = [
      { [JSON.stringify(robot)]: robot },
    ];

    while (
      Object.values(affectedLayers[affectedLayers.length - 1]).some((space) =>
        /\[|\]/.test(doubleWide[space[0] - 1][space[1]]),
      ) &&
      Object.values(affectedLayers[affectedLayers.length - 1]).every(
        (space) => doubleWide[space[0] - 1][space[1]] !== '#',
      )
    ) {
      const newLayer: Record<string, Coordinate> = {};

      Object.values(affectedLayers[affectedLayers.length - 1]).forEach(
        (space) => {
          if (/\[|\]/.test(doubleWide[space[0] - 1][space[1]])) {
            const newSpaces: Coordinate[] = [[space[0] - 1, space[1]]];

            if (doubleWide[space[0] - 1][space[1]] === '[') {
              newSpaces.push([space[0] - 1, space[1] + 1]);
            } else if (doubleWide[space[0] - 1][space[1]] === ']') {
              newSpaces.unshift([space[0] - 1, space[1] - 1]);
            }

            newSpaces.forEach(
              (newSpace) => (newLayer[JSON.stringify(newSpace)] = newSpace),
            );
          }
        },
      );

      affectedLayers.push(newLayer);
    }

    if (
      Object.values(affectedLayers[affectedLayers.length - 1]).every(
        (space) => doubleWide[space[0] - 1][space[1]] !== '#',
      )
    ) {
      affectedLayers.reverse().forEach((layer) => {
        Object.values(layer).forEach((space) => {
          doubleWide[space[0] - 1][space[1]] = doubleWide[space[0]][space[1]];
          doubleWide[space[0]][space[1]] = '.';
        });
      });

      robot = [row - 1, col];
    }
  } else if (move === 'v') {
    const affectedLayers: Record<string, Coordinate>[] = [
      { [JSON.stringify(robot)]: robot },
    ];

    while (
      Object.values(affectedLayers[affectedLayers.length - 1]).some((space) =>
        /\[|\]/.test(doubleWide[space[0] + 1][space[1]]),
      ) &&
      Object.values(affectedLayers[affectedLayers.length - 1]).every(
        (space) => doubleWide[space[0] + 1][space[1]] !== '#',
      )
    ) {
      const newLayer: Record<string, Coordinate> = {};

      Object.values(affectedLayers[affectedLayers.length - 1]).forEach(
        (space) => {
          if (/\[|\]/.test(doubleWide[space[0] + 1][space[1]])) {
            const newSpaces: Coordinate[] = [[space[0] + 1, space[1]]];

            if (doubleWide[space[0] + 1][space[1]] === '[') {
              newSpaces.push([space[0] + 1, space[1] + 1]);
            } else if (doubleWide[space[0] + 1][space[1]] === ']') {
              newSpaces.unshift([space[0] + 1, space[1] - 1]);
            }

            newSpaces.forEach(
              (newSpace) => (newLayer[JSON.stringify(newSpace)] = newSpace),
            );
          }
        },
      );

      affectedLayers.push(newLayer);
    }

    if (
      Object.values(affectedLayers[affectedLayers.length - 1]).every(
        (space) => doubleWide[space[0] + 1][space[1]] !== '#',
      )
    ) {
      affectedLayers.reverse().forEach((layer) => {
        Object.values(layer).forEach((space) => {
          doubleWide[space[0] + 1][space[1]] = doubleWide[space[0]][space[1]];
          doubleWide[space[0]][space[1]] = '.';
        });
      });

      robot = [row + 1, col];
    }
  } else if (move === '<') {
    const affectedSpaces: Coordinate[] = [robot];
    let i = col;

    while (/\[|\]/.test(doubleWide[row][i - 1])) {
      affectedSpaces.push([row, i - 1]);
      i--;
    }

    if (doubleWide[row][i - 1] === '.') {
      while (i <= col) {
        const replacement = affectedSpaces[col - i];
        doubleWide[row][i - 1] = doubleWide[replacement[0]][replacement[1]];
        i++;
      }

      robot = [row, col - 1];
      doubleWide[row][col] = '.';
    }
  } else if (move === '>') {
    const affectedSpaces: Coordinate[] = [robot];
    let i = col;

    while (/\[|\]/.test(doubleWide[row][i + 1])) {
      affectedSpaces.push([row, i + 1]);
      i++;
    }

    if (doubleWide[row][i + 1] === '.') {
      while (i >= col) {
        const replacement = affectedSpaces[i - col];
        doubleWide[row][i + 1] = doubleWide[replacement[0]][replacement[1]];
        i--;
      }

      robot = [row, col + 1];
      doubleWide[row][col] = '.';
    }
  }
});

const wideBoxes = [
  ...doubleWide
    .map((row) => row.join(''))
    .join('')
    .matchAll(/\[/g),
].map((match) => toCoordinate(doubleWide[0].length, match.index));

const wideSum = wideBoxes.reduce(
  (sum, [row, col]) => (sum += 100 * row + col),
  0,
);

console.log(wideSum);
