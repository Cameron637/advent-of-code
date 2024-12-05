#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

const [rules, updateStrings] = input
  .split('\n\n')
  .map((value) => value.split('\n'));

const updates = updateStrings.map((updateString) => updateString.split(','));

function isCorrect(update: string[]): boolean {
  return update.every((page, index) => {
    const beforePages = rules
      .filter((rule) => rule.endsWith(page))
      .map((rule) => rule.split('|')[0]);

    const afterPages = rules
      .filter((rule) => rule.startsWith(page))
      .map((rule) => rule.split('|')[1]);

    return (
      beforePages.every(
        (beforePage) =>
          !update.includes(beforePage) || update.indexOf(beforePage) < index,
      ) &&
      afterPages.every(
        (afterPage) =>
          !update.includes(afterPage) || update.indexOf(afterPage) > index,
      )
    );
  });
}

const correctUpdates = updates.filter((update) => isCorrect(update));

function getMiddlePageSum(updatesList: string[][]): number {
  return updatesList.reduce(
    (sum, update) => sum + parseInt(update[Math.floor(update.length / 2)], 10),
    0,
  );
}

console.log(getMiddlePageSum(correctUpdates));

const incorrectUpdates = updates.filter((update) => !isCorrect(update));

const corrected = incorrectUpdates.map((update) =>
  update.toSorted((a, b) => {
    const applicableRule = rules.find(
      (rule) => rule.includes(a) && rule.includes(b),
    );

    return applicableRule
      ? applicableRule.indexOf(a) - applicableRule.indexOf(b)
      : 0;
  }),
);

console.log(getMiddlePageSum(corrected));
