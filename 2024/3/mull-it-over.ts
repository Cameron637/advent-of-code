#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

function addValidMuls(handleConditionals = false): number {
  let validMuls = [...input.matchAll(/mul\((\d{1,3}),(\d{1,3}\))/g)];

  if (handleConditionals) {
    const conditionals = input.matchAll(/do\(\)|don't\(\)/g);
    const doSections: [number, number][] = [];
    let startIndex = 0;
    let doSection = true;

    for (const conditional of conditionals) {
      if (doSection && conditional[0] === "don't()") {
        doSections.push([startIndex, conditional.index]);
        doSection = false;
      } else if (!doSection && conditional[0] === 'do()') {
        startIndex = conditional.index;
        doSection = true;
      }
    }

    validMuls = validMuls.filter(({ index }) =>
      doSections.some(([start, end]) => index > start && index < end),
    );
  }

  return validMuls.reduce(
    (sum, mul) => (sum += parseInt(mul[1], 10) * parseInt(mul[2], 10)),
    0,
  );
}

console.log(addValidMuls());
console.log(addValidMuls(true));
