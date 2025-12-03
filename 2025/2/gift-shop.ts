#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

function* range(start: number, end: number): Generator<number, void, unknown> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

function isRepeatedSequence(s: string): boolean {
  const { length } = s;

  for (const i of range(1, Math.floor(length / 2) + 1)) {
    if (length % i === 0 && s.slice(0, i).repeat(length / i) === s) {
      return true;
    }
  }

  return false;
}

type Range = [number, number];

function getInvalidSum([start, end]: Range): number {
  const invalidIds: number[] = [];

  for (const i of range(start, end + 1)) {
    const id = `${i}`;

    if (
      id.length % 2 === 0 &&
      id.slice(0, id.length / 2) === id.slice(id.length / 2)
    ) {
      invalidIds.push(i);
    }
  }

  return invalidIds.reduce((sum, x) => sum + x, 0);
}

function getInvalidSum2([start, end]: Range): number {
  const invalidIds: number[] = [];

  for (const i of range(start, end + 1)) {
    if (isRepeatedSequence(`${i}`)) {
      invalidIds.push(i);
    }
  }

  return invalidIds.reduce((sum, x) => sum + x, 0);
}

function getTotalInvalidSum(ranges: Range[]) {
  return ranges.reduce(
    (sum, currentRange) => sum + getInvalidSum(currentRange),
    0,
  );
}

function getTotalInvalidSum2(ranges: Range[]) {
  return ranges.reduce(
    (sum, currentRange) => sum + getInvalidSum2(currentRange),
    0,
  );
}

const ranges = readFileSync(resolve(__dirname, 'input'), 'utf-8')
  .trim()
  .split(',')
  .map((idRange) => idRange.split('-').map((x) => parseInt(x, 10)) as Range);

console.log(getTotalInvalidSum(ranges));
console.log(getTotalInvalidSum2(ranges));
