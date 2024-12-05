#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

const [rules, updateStrings] = input
  .split('\n\n')
  .map((value) => value.split('\n'));

const updates = updateStrings.map((updateString) => updateString.split(','));

function correct(update: string[]): string[] {
  return update.toSorted((a, b) => {
    const applicableRule = rules.find(
      (rule) => rule.includes(a) && rule.includes(b),
    );

    return applicableRule
      ? applicableRule.indexOf(a) - applicableRule.indexOf(b)
      : 0;
  });
}

const correctUpdates = updates.filter(
  (update) => correct(update).join(',') === update.join(','),
);

function getMiddlePageSum(updatesList: string[][]): number {
  return updatesList.reduce(
    (sum, update) => sum + parseInt(update[Math.floor(update.length / 2)], 10),
    0,
  );
}

console.log(getMiddlePageSum(correctUpdates));

const incorrectUpdates = updates.filter(
  (update) => correct(update).join(',') !== update.join(','),
);

const corrected = incorrectUpdates.map((update) => correct(update));
console.log(getMiddlePageSum(corrected));
