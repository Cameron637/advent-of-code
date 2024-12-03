#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

function addValidMuls(handleConditionals = false): number {
  let validMuls = [...input.matchAll(/mul\((\d{1,3}),(\d{1,3}\))/g)];

  if (handleConditionals) {
    const conditionals = [...input.matchAll(/do\(\)|don't\(\)/g)].reverse();
    const doSections: [number, number][] = [];
    let startIndex = 0;
    let doSection = true;

    while (conditionals.length) {
      const conditional = conditionals.pop();

      if (conditional && doSection && conditional[0] === "don't()") {
        doSections.push([startIndex, conditional.index]);
        doSection = false;
      } else if (conditional && !doSection && conditional[0] === 'do()') {
        startIndex = conditional.index;
        doSection = true;
      }
    }

    validMuls = validMuls.filter((mul) =>
      doSections.some(([start, end]) => mul.index > start && mul.index < end),
    );
  }

  return validMuls.reduce(
    (sum, value) => (sum += parseInt(value[1], 10) * parseInt(value[2], 10)),
    0,
  );
}

console.log(addValidMuls());
console.log(addValidMuls(true));
