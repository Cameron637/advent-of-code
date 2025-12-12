#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

type Coordinate = [number, number];

function calculateArea([x1, y1]: Coordinate, [x2, y2]: Coordinate): number {
  const length = Math.abs(x2 - x1) + 1;
  const width = Math.abs(y2 - y1) + 1;
  return length * width;
}

function parseInput(input: string): Coordinate[] {
  return input
    .split('\n')
    .map((line) => line.split(',').map((x) => parseInt(x, 10)) as Coordinate);
}

function findLargestArea(redTiles: Coordinate[]): number {
  let largest = 0;

  for (const tile of redTiles) {
    for (const otherTile of redTiles) {
      largest = Math.max(largest, calculateArea(tile, otherTile));
    }
  }

  return largest;
}

type Edge = [Coordinate, Coordinate];
type Orientation = 'horizontal' | 'vertical';

function orientation([[, y1], [, y2]]: Edge): Orientation {
  return y1 === y2 ? 'horizontal' : 'vertical';
}

function intersects(edge1: Edge, edge2: Edge): boolean {
  if (orientation(edge1) === orientation(edge2)) {
    return false;
  }

  const horizontal = [edge1, edge2].find(
    (edge) => orientation(edge) === 'horizontal',
  )!;

  const vertical = [edge1, edge2].find(
    (edge) => orientation(edge) === 'vertical',
  )!;

  return (
    vertical[0][0] > horizontal[0][0] &&
    vertical[0][0] < horizontal[1][0] &&
    horizontal[0][1] > vertical[0][1] &&
    horizontal[0][1] < vertical[1][1]
  );
}

function isRectangleInPolygon(
  p1: Coordinate,
  p2: Coordinate,
  polygon: Coordinate[],
): boolean {
  const x1 = Math.min(p1[0], p2[0]) + 0.5;
  const x2 = Math.max(p1[0], p2[0]) - 0.5;
  const y1 = Math.min(p1[1], p2[1]) + 0.5;
  const y2 = Math.max(p1[1], p2[1]) - 0.5;

  const edges: Edge[] = [
    [
      [x1, y1],
      [x1, y2],
    ],
    [
      [x1, y2],
      [x2, y2],
    ],
    [
      [x2, y1],
      [x2, y2],
    ],
    [
      [x1, y1],
      [x2, y1],
    ],
  ];

  for (let i = 0; i < polygon.length; i++) {
    const p3 = polygon[i];
    const p4 = polygon[(i + 1) % polygon.length];

    const polyEdge =
      orientation([p3, p4]) === 'horizontal'
        ? ([p3, p4].toSorted(([x3], [x4]) => x3 - x4) as Edge)
        : ([p3, p4].toSorted(([, y3], [, y4]) => y3 - y4) as Edge);

    if (edges.some((edge) => intersects(edge, polyEdge))) {
      return false;
    }
  }

  return true;
}

function findLargestBoundedArea(redTiles: Coordinate[]): number {
  let largest = 0;

  for (const [x1, y1] of redTiles) {
    for (const [x2, y2] of redTiles) {
      const area = calculateArea([x1, y1], [x2, y2]);

      if (
        area > largest &&
        isRectangleInPolygon([x1, y1], [x2, y2], redTiles)
      ) {
        largest = area;
      }
    }
  }

  return largest;
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8').trim();
const redTiles = parseInput(input);
console.log(findLargestArea(redTiles));
console.log(findLargestBoundedArea(redTiles));
