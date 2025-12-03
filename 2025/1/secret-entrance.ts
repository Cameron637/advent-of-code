#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

interface Dial {
  size: number;
  value: number;
  zeroCounter: {
    count: number;
    method: 'per-click' | 'per-dial';
  };
}

type Direction = 'L' | 'R';
type Instruction = [Direction, number];
type Operation = (a: number, b: number) => number;

const operations: Record<Direction, Operation> = {
  L: (a: number, b: number) => a + b,
  R: (a: number, b: number) => a - b,
};

function calculateZeroClicks(
  dial: Dial,
  [direction, distance]: Instruction,
): number {
  const distanceToZero =
    direction === 'L'
      ? (dial.size - dial.value) % dial.size
      : dial.value % dial.size;

  const firstZero = distance >= distanceToZero ? 1 : 0;

  const fullRotations =
    distance >= distanceToZero
      ? Math.floor((distance - distanceToZero) / dial.size)
      : 0;

  return dial.value !== 0 ? firstZero + fullRotations : fullRotations;
}

function rotate(dial: Dial, [direction, distance]: Instruction): Dial {
  const { size, value, zeroCounter } = dial;
  const rawResult = operations[direction](value, distance);
  const result = ((rawResult % size) + size) % size; // Handle negative modulo
  const { count, method } = zeroCounter;

  return {
    ...dial,
    value: result,
    zeroCounter: {
      ...zeroCounter,
      count:
        method === 'per-click'
          ? count + calculateZeroClicks(dial, [direction, distance])
          : count + (result === 0 ? 1 : 0),
    },
  };
}

const instructions: Instruction[] = readFileSync(
  resolve(__dirname, 'input'),
  'utf-8',
)
  .trim()
  .split('\n')
  .map<Instruction>((line) => [
    line.slice(0, 1) as Direction,
    parseInt(line.slice(1), 10),
  ]);

const dial1: Dial = {
  size: 100,
  value: 50,
  zeroCounter: { count: 0, method: 'per-dial' },
};

const result1 = instructions.reduce(
  (dial, instruction) => rotate(dial, instruction),
  dial1,
);

console.log(result1.zeroCounter.count);

const dial2: Dial = {
  ...dial1,
  zeroCounter: { ...dial1.zeroCounter, method: 'per-click' },
};

const result2 = instructions.reduce(
  (dial, instruction) => rotate(dial, instruction),
  dial2,
);

console.log(result2.zeroCounter.count);
