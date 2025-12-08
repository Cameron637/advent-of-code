#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

type Position = [number, number, number];

function getDistance([x1, y1, z1]: Position, [x2, y2, z2]: Position): number {
  return Math.sqrt(
    Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2),
  );
}

type DistanceMap = Map<number, [Position, Position][]>;

function getDistanceMap(junctionBoxes: Position[]): DistanceMap {
  return junctionBoxes.reduce((map, junctionBox) => {
    for (const otherJunctionBox of junctionBoxes) {
      if (junctionBox !== otherJunctionBox) {
        const distance = getDistance(junctionBox, otherJunctionBox);
        const existing = map.get(distance) ?? [];

        if (
          !existing.some(
            (pair) =>
              pair.includes(junctionBox) && pair.includes(otherJunctionBox),
          )
        ) {
          map.set(distance, [...existing, [junctionBox, otherJunctionBox]]);
        }
      }
    }

    return map;
  }, new Map<number, [Position, Position][]>());
}

function sortDistanceMap(original: DistanceMap): DistanceMap {
  const sortedKeys = [...original.keys()].toSorted((a, b) => a - b);
  const sortedMap = new Map<number, [Position, Position][]>();

  for (const key of sortedKeys) {
    sortedMap.set(key, original.get(key)!);
  }

  return sortedMap;
}

interface CircuitList {
  sortedCircuits: Set<Position>[];
  lastConnection: [Position, Position];
}

function getSortedCircuits(
  junctionBoxes: Position[],
  sortedDistanceMap: DistanceMap,
  limit = Infinity,
): CircuitList {
  let circuits: Set<Position>[] = junctionBoxes.map(
    (junctionBox) => new Set([junctionBox]),
  );

  let i = 0;
  let lastConnection: [Position, Position];

  for (const closestPairs of sortedDistanceMap.values()) {
    for (const [box1, box2] of closestPairs) {
      const box1Index = circuits.findIndex((circuit) => circuit.has(box1));
      const box2Index = circuits.findIndex((circuit) => circuit.has(box2));
      const box1Circuit = circuits[box1Index];
      const box2Circuit = circuits[box2Index];
      const minRemovedIndex = Math.min(box1Index, box2Index);
      const maxRemovedIndex = Math.max(box1Index, box2Index);

      circuits = [
        box1Circuit.union(box2Circuit),
        ...circuits.slice(0, minRemovedIndex),
        ...circuits.slice(minRemovedIndex + 1, maxRemovedIndex),
        ...circuits.slice(maxRemovedIndex + 1),
      ];

      i++;
      lastConnection = [box1, box2];

      if (i >= limit || circuits.length < 2) {
        break;
      }
    }

    if (i >= limit || circuits.length < 2) {
      break;
    }
  }

  return {
    sortedCircuits: circuits.toSorted((a, b) => b.size - a.size),
    lastConnection: lastConnection!,
  };
}

function top3Value(sortedCircuits: Set<Position>[]): number {
  return sortedCircuits
    .slice(0, 3)
    .reduce((product, circuit) => product * circuit.size, 1);
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8').trim();

const junctionBoxes = input
  .split('\n')
  .map((line) => line.split(',').map((x) => parseInt(x, 10)) as Position);

const distanceMap = getDistanceMap(junctionBoxes);
const sortedDistanceMap = sortDistanceMap(distanceMap);

const { sortedCircuits } = getSortedCircuits(
  junctionBoxes,
  sortedDistanceMap,
  1000,
);

console.log(top3Value(sortedCircuits));
const { lastConnection } = getSortedCircuits(junctionBoxes, sortedDistanceMap);
console.log(lastConnection[0][0] * lastConnection[1][0]);
