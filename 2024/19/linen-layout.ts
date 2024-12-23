#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

const [availableString, desiredString] = input.split('\n\n');
const available = availableString.split(', ');
const desired = desiredString.split('\n');

const possible = desired.reduce((options, design) => {
  const relevant = available.filter((pattern) => design.includes(pattern));
  const possibilities = new Map<string, number>([['', 1]]);

  while (possibilities.size) {
    const entries = [...possibilities.entries()];
    possibilities.clear();

    for (const [combination, count] of entries) {
      const remaining = design.replace(combination, '');

      if (remaining) {
        relevant.forEach((pattern) => {
          if (remaining.startsWith(pattern)) {
            const combined = `${combination}${pattern}`;

            possibilities.set(
              combined,
              (possibilities.get(combined) ?? 0) + count,
            );
          }
        });
      } else {
        options.set(design, (options.get(design) ?? 0) + count);
      }
    }
  }

  return options;
}, new Map<string, number>());

console.log(possible.size);
console.log([...possible.values()].reduce((sum, value) => sum + value, 0));
