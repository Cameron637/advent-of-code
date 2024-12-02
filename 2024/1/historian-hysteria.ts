#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

const [list1, list2] = input
  .trim()
  .split('\n')
  .reduce(
    ([builder1, builder2]: [number[], number[]], line) => {
      const [input1, input2] = line.split(/\s+/);

      return [
        [...builder1, parseInt(input1, 10)],
        [...builder2, parseInt(input2, 10)],
      ];
    },
    [[], []],
  );

function getTotalDistance(): number {
  const [sorted1, sorted2] = [list1, list2].map((list) => [...list].sort());

  const distances = sorted1.map((location, index) =>
    Math.abs(location - sorted2[index]),
  );

  return distances.reduce((sum, distance) => sum + distance, 0);
}

console.log(getTotalDistance());

function getSimilarityScore(): number {
  return list1.reduce(
    (score, location1) =>
      (score +=
        location1 *
        list2.filter((location2) => location1 === location2).length),
    0,
  );
}

console.log(getSimilarityScore());
