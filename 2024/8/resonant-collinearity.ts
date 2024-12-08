#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const rows = input.split('\n');
const columns = rows[0].length;

type Coordinate = [number, number];

function toCoordinate(index: number): Coordinate {
  const row = Math.floor(index / columns);
  const col = index % columns;
  return [row, col];
}

function toIndex([row, col]: Coordinate): number {
  return row * columns + col;
}

function markAntinode(map: string, index: number): string {
  return `${map.substring(0, index)}#${map.substring(index + 1)}`;
}

function printMap(map: string): void {
  const rowRegExp = new RegExp(`.{1,${columns}}`, 'g');
  const printRows = map.match(rowRegExp) || [];
  console.log(printRows.join('\n'));
}

function countAntinodes(harmonics = false): number {
  const antennaMap = rows.join('');
  const antennas = [...antennaMap.matchAll(/[a-zA-Z0-9]/g)];
  let antinodeMap = '.'.repeat(antennaMap.length);

  antennas.forEach((antenna) => {
    const frequency = antenna[0];

    const resonatingAntennas = antennas.filter(
      (otherAntenna) =>
        antenna !== otherAntenna && frequency === otherAntenna[0],
    );

    resonatingAntennas.forEach((resonating) => {
      const [first, second] = [antenna.index, resonating.index]
        .toSorted((a, b) => a - b)
        .map((index) => toCoordinate(index));

      const rowDistance = second[0] - first[0];
      const colDistance = Math.abs(second[1] - first[1]);

      if (harmonics) {
        antinodeMap = markAntinode(antinodeMap, antenna.index);
        antinodeMap = markAntinode(antinodeMap, resonating.index);
        let firstCoord = first;
        let secondCoord = second;

        while (
          firstCoord[0] - rowDistance >= 0 &&
          (first[1] < second[1]
            ? firstCoord[1] - colDistance >= 0
            : firstCoord[1] + colDistance < columns)
        ) {
          const antinode: Coordinate = [
            firstCoord[0] - rowDistance,
            first[1] < second[1]
              ? firstCoord[1] - colDistance
              : firstCoord[1] + colDistance,
          ];

          antinodeMap = markAntinode(antinodeMap, toIndex(antinode));
          firstCoord = antinode;
        }

        while (
          secondCoord[0] + rowDistance < rows.length &&
          (second[1] > first[1]
            ? secondCoord[1] + colDistance < columns
            : secondCoord[1] - colDistance >= 0)
        ) {
          const antinode: Coordinate = [
            secondCoord[0] + rowDistance,
            second[1] > first[1]
              ? secondCoord[1] + colDistance
              : secondCoord[1] - colDistance,
          ];

          antinodeMap = markAntinode(antinodeMap, toIndex(antinode));
          secondCoord = antinode;
        }
      } else {
        const firstAntinode: Coordinate = [
          first[0] - rowDistance,
          first[1] < second[1]
            ? first[1] - colDistance
            : first[1] + colDistance,
        ];

        const secondAntinode: Coordinate = [
          second[0] + rowDistance,
          second[1] > first[1]
            ? second[1] + colDistance
            : second[1] - colDistance,
        ];

        [firstAntinode, secondAntinode].forEach((antinode) => {
          if (
            antinode[0] >= 0 &&
            antinode[0] < rows.length &&
            antinode[1] >= 0 &&
            antinode[1] < columns
          ) {
            antinodeMap = markAntinode(antinodeMap, toIndex(antinode));
          }
        });
      }
    });
  });

  printMap(antinodeMap);
  return [...antinodeMap.matchAll(/#/g)].length;
}

console.log(countAntinodes());
console.log(countAntinodes(true));
