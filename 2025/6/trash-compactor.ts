#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const operations = {
  '*': (operands: number[]) =>
    operands.reduce((product, operand) => product * operand, 1),
  '+': (operands: number[]) =>
    operands.reduce((sum, operand) => sum + operand, 0),
};

function check1(math: string): number {
  const lines = math
    .trim()
    .split('\n')
    .map((line) => line.trim().split(/\s+/));

  let total = 0;

  for (let i = 0; i < lines[0].length; i++) {
    const operands: number[] = [];

    for (let j = 0; j < lines.length - 1; j++) {
      operands.push(parseInt(lines[j][i], 10));
    }

    const operator = lines[lines.length - 1][i];
    total += operations[operator as keyof typeof operations](operands);
  }

  return total;
}

function check2(math: string): number {
  const lines = math
    .replace(/[\r\n]+$/, '')
    .split('\n')
    .map((line) => line.split(''));

  let total = 0;
  let operands: number[] = [];

  for (let i = lines[0].length - 1; i >= 0; i--) {
    const column: string[] = [];

    for (let j = 0; j < lines.length - 1; j++) {
      column.push(lines[j][i]);
    }

    operands.push(parseInt(column.join(''), 10));

    if (lines[lines.length - 1][i] !== ' ') {
      const operator = lines[lines.length - 1][i];
      total += operations[operator as keyof typeof operations](operands);
      operands = [];
      i--;
    }
  }

  return total;
}

const math = readFileSync(resolve(__dirname, 'input'), 'utf-8');
console.log(check1(math));
console.log(check2(math));
