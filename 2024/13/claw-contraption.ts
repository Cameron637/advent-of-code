#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

interface Machine {
  a: [number, number];
  b: [number, number];
  prize: [number, number];
}

function getFewestTokensIterative(machines: Machine[]): number {
  interface Combo {
    a: number;
    b: number;
  }

  return machines.reduce((totalTokens, machine) => {
    const [ax, ay] = machine.a;
    const [bx, by] = machine.b;
    const [px, py] = machine.prize;
    const maxA = Math.min(Math.floor(px / ax), Math.floor(py / ay));
    const maxB = Math.min(Math.floor(px / bx), Math.floor(py / by));
    const combinations: Combo[] = [];

    for (let i = 0; i <= maxA; i++) {
      const position = [i * ax, i * bx];
      const remaining = [px - position[0], py - position[1]];

      if (
        remaining[0] % bx === 0 &&
        remaining[1] % by === 0 &&
        remaining[0] / bx === remaining[1] / by
      ) {
        combinations.push({ a: i, b: remaining[0] / bx });
      }
    }

    for (let i = 0; i <= maxB; i++) {
      const position = [i * bx, i * by];
      const remaining = [px - position[0], py - position[1]];

      if (
        remaining[0] % ax === 0 &&
        remaining[1] % ay === 0 &&
        remaining[0] / ax === remaining[1] / ay
      ) {
        combinations.push({ a: remaining[0] / ax, b: i });
      }
    }

    const tokens = combinations.length
      ? Math.min(...combinations.map(({ a, b }) => a * 3 + b * 1))
      : 0;

    return totalTokens + tokens;
  }, 0);
}

function getFewestTokensAlgebraic(machines: Machine[]): number {
  return machines.reduce((totalTokens, machine) => {
    const [ax, ay] = machine.a;
    const [bx, by] = machine.b;
    const [px, py] = machine.prize.map((unit) => unit + 10000000000000);
    const b = (px * ay - ax * py) / (bx * ay - ax * by);
    const a = (px - b * bx) / ax;
    const tokens = Number.isInteger(a) && Number.isInteger(b) ? 3 * a + b : 0;
    return totalTokens + tokens;
  }, 0);
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

const machines: Machine[] = input.split('\n\n').map((machine) => {
  const numbers = [...machine.matchAll(/\d+/g)];

  const [ax, ay, bx, by, px, py] = numbers.map((number) =>
    parseInt(number[0], 10),
  );

  return {
    a: [ax, ay],
    b: [bx, by],
    prize: [px, py],
  };
});

console.log(getFewestTokensIterative(machines));
console.log(getFewestTokensAlgebraic(machines));
