#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Coordinate, toCoordinate } from '../../util/util';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

interface Tile {
  score: number;
  value: string;
}

const map: Tile[][] = input.split('\n').map((row) =>
  row.split('').map((value) => ({
    score: Number.POSITIVE_INFINITY,
    value,
  })),
);

const start = toCoordinate(
  map[0].length,
  input.replaceAll('\n', '').indexOf('S'),
);

type Direction = '^' | 'v' | '<' | '>';

interface Postion {
  direction: Direction;
  position: Coordinate;
}

interface Explorer {
  path: Postion[];
  score: number;
}

function explore(explorer: Explorer): Explorer[] {
  const { direction, position } = explorer.path[explorer.path.length - 1];

  return [
    {
      path: [
        ...explorer.path,
        { direction: '^', position: [position[0] - 1, position[1]] },
      ],
      score: direction === '^' ? explorer.score + 1 : explorer.score + 1001,
    },
    {
      path: [
        ...explorer.path,
        { direction: 'v', position: [position[0] + 1, position[1]] },
      ],
      score: direction === 'v' ? explorer.score + 1 : explorer.score + 1001,
    },
    {
      path: [
        ...explorer.path,
        { direction: '<', position: [position[0], position[1] - 1] },
      ],
      score: direction === '<' ? explorer.score + 1 : explorer.score + 1001,
    },
    {
      path: [
        ...explorer.path,
        { direction: '>', position: [position[0], position[1] + 1] },
      ],
      score: direction === '>' ? explorer.score + 1 : explorer.score + 1001,
    },
  ];
}

const explorers: Explorer[] = [
  { path: [{ direction: '>', position: start }], score: 0 },
];

interface BestTracker {
  score: number;
  explorers: Explorer[];
}

const best: BestTracker = {
  score: Number.POSITIVE_INFINITY,
  explorers: [],
};

while (explorers.length) {
  const explorer = explorers.pop()!;
  const { direction, position } = explorer.path[explorer.path.length - 1];
  const tile = map[position[0]][position[1]];

  if (explorer.score <= tile.score) {
    tile.score = explorer.score;
    const prev = explorer.path[explorer.path.length - 2];

    if (prev && prev.direction !== direction) {
      map[prev.position[0]][prev.position[1]].score += 1000;
    }

    if (tile.value === 'E') {
      if (explorer.score < best.score) {
        best.score = explorer.score;
        best.explorers = [explorer];
      } else {
        best.explorers.push(explorer);
      }
    } else {
      explorers.push(
        ...explore(explorer).filter(({ path }) => {
          const pos = path[path.length - 1].position;
          return map[pos[0]][pos[1]].value !== '#';
        }),
      );
    }
  }
}

console.log(best.score);

const bestTiles = new Set(
  best.explorers.flatMap(({ path }) =>
    path.map((pos) => JSON.stringify(pos.position)),
  ),
);

console.log(bestTiles.size);
