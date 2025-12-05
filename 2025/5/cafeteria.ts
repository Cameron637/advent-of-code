#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

type Range = [number, number];

function parseInput(): [Range[], number[]] {
  const [rangeList, ingredientList] = readFileSync(
    resolve(__dirname, 'input'),
    'utf-8',
  )
    .trim()
    .split('\n\n');

  const ranges = rangeList
    .split('\n')
    .map((range) => range.split('-').map((x) => parseInt(x, 10)) as Range);

  const ingredientIds = ingredientList
    .split('\n')
    .map((id) => parseInt(id, 10));

  return [ranges, ingredientIds];
}

function isFresh(ranges: Range[], ingredientId: number): boolean {
  return ranges.some(
    ([start, end]) => ingredientId >= start && ingredientId <= end,
  );
}

function countFresh(ranges: Range[], ingredientIds: number[]): number {
  return ingredientIds.reduce(
    (count, id) => (isFresh(ranges, id) ? count + 1 : count),
    0,
  );
}

function combineRanges(ranges: Range[]): Range[] {
  const rangeSet = new Set<string>();

  for (let i = 0; i < ranges.length; i++) {
    let [start, end] = ranges[i];

    for (let j = 0; j < ranges.length; j++) {
      const [start2, end2] = ranges[j];

      if (start2 >= start && start2 <= end) {
        end = Math.max(end, end2);
      } else if (start >= start2 && start <= end2) {
        start = start2;
        end = Math.max(end, end2);
      }
    }

    rangeSet.add(`${start}-${end}`);
  }

  return rangeSet
    .values()
    .map((range) => range.split('-').map((x) => parseInt(x, 10)) as Range)
    .toArray();
}

function countAllFresh(ranges: Range[]): number {
  let current = ranges;
  let combined = combineRanges(current);

  while (JSON.stringify(current) !== JSON.stringify(combined)) {
    current = combined;
    combined = combineRanges(current);
  }

  return combined.reduce(
    (count, [start, end]) => (count += end - start + 1),
    0,
  );
}

const [ranges, ingredientIds] = parseInput();
console.log(countFresh(ranges, ingredientIds));
console.log(countAllFresh(ranges));
