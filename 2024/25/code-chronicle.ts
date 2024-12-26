#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const schematics = input
  .split('\n\n')
  .map((schematic) => schematic.split('\n'));

const [keys, locks] = [
  schematics.filter(
    (schematic) =>
      /^\.+$/.test(schematic[0]) &&
      /^#+$/.test(schematic[schematic.length - 1]),
  ),
  schematics.filter(
    (schematic) =>
      /^#+$/.test(schematic[0]) &&
      /^\.+$/.test(schematic[schematic.length - 1]),
  ),
];

const keyHeights = keys.map((key) => {
  const pinHeights: number[] = [];

  for (let i = 0; i < key[0].length; i++) {
    let pinHeight = 0;

    while (
      pinHeight < key.length - 2 &&
      key[key.length - pinHeight - 2][i] === '#'
    ) {
      pinHeight++;
    }

    pinHeights.push(pinHeight);
  }

  return pinHeights;
});

const lockHeights = locks.map((lock) => {
  const pinHeights: number[] = [];

  for (let i = 0; i < lock[0].length; i++) {
    let pinHeight = 0;

    while (pinHeight < lock.length - 2 && lock[pinHeight + 1][i] === '#') {
      pinHeight++;
    }

    pinHeights.push(pinHeight);
  }

  return pinHeights;
});

const uniqueLockKeyPairs = lockHeights.reduce((count, pinHeights) => {
  const fittingKeys = keyHeights.filter((keyPinHeights) =>
    keyPinHeights.every(
      (pinHeight, index) => pinHeight + pinHeights[index] < 6,
    ),
  );
  return count + fittingKeys.length;
}, 0);

console.log(uniqueLockKeyPairs);
