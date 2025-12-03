#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

function getHighestJoltage(bank: number[], limit = 2): number {
  const strongestBatteries: number[] = [];
  let remainder = bank;

  for (let i = limit; i > 0; i--) {
    const strongest = Math.max(
      ...remainder.slice(0, remainder.length - (i - 1)),
    );

    strongestBatteries.push(strongest);
    remainder = remainder.slice(remainder.indexOf(strongest) + 1);
  }

  return parseInt(strongestBatteries.join(''), 10);
}

function getTotalJoltage(banks: number[][], limit = 2): number {
  return banks.reduce(
    (total, bank) => total + getHighestJoltage(bank, limit),
    0,
  );
}

const banks = readFileSync(resolve(__dirname, 'input'), 'utf-8')
  .trim()
  .split('\n')
  .map((bank) => bank.split('').map((digit) => parseInt(digit, 10)));

console.log(getTotalJoltage(banks));
console.log(getTotalJoltage(banks, 12));
