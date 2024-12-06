#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

function markGaurdPath(map: string): string {
  const pivots = new Set<string>();
  const lines = map.split('\n');
  const [length, width] = [lines.length, lines[0].length];
  let guard = '^';

  while (guard) {
    let x = lines.findIndex((line) => line.includes(guard));
    let y = lines[x].indexOf(guard);

    if (pivots.has(`${guard},${x},${y}`)) {
      throw new Error('Stuck in a loop');
    } else {
      pivots.add(`${guard},${x},${y}`);
    }

    if (guard === '^') {
      while (x > 0 && lines[x - 1].charAt(y) !== '#') {
        lines[x] = `${lines[x].slice(0, y)}X${lines[x].slice(y + 1)}`;
        x--;
      }

      if (x > 0) {
        lines[x] = `${lines[x].slice(0, y)}>${lines[x].slice(y + 1)}`;
        guard = '>';
      } else {
        lines[x] = `${lines[x].slice(0, y)}X${lines[x].slice(y + 1)}`;
        guard = '';
      }
    } else if (guard === '>') {
      while (y < width - 1 && lines[x].charAt(y + 1) !== '#') {
        lines[x] = `${lines[x].slice(0, y)}X${lines[x].slice(y + 1)}`;
        y++;
      }

      if (y < width - 1) {
        lines[x] = `${lines[x].slice(0, y)}V${lines[x].slice(y + 1)}`;
        guard = 'V';
      } else {
        lines[x] = `${lines[x].slice(0, y)}X${lines[x].slice(y + 1)}`;
        guard = '';
      }
    } else if (guard === 'V') {
      while (x < length - 1 && lines[x + 1].charAt(y) !== '#') {
        lines[x] = `${lines[x].slice(0, y)}X${lines[x].slice(y + 1)}`;
        x++;
      }

      if (x < length - 1) {
        lines[x] = `${lines[x].slice(0, y)}<${lines[x].slice(y + 1)}`;
        guard = '<';
      } else {
        lines[x] = `${lines[x].slice(0, y)}X${lines[x].slice(y + 1)}`;
        guard = '';
      }
    } else if (guard === '<') {
      while (y > 0 && lines[x].charAt(y - 1) !== '#') {
        lines[x] = `${lines[x].slice(0, y)}X${lines[x].slice(y + 1)}`;
        y--;
      }

      if (y > 0) {
        lines[x] = `${lines[x].slice(0, y)}^${lines[x].slice(y + 1)}`;
        guard = '^';
      } else {
        lines[x] = `${lines[x].slice(0, y)}X${lines[x].slice(y + 1)}`;
        guard = '';
      }
    }

    map = lines.join('\n');
  }

  return map;
}

const map = markGaurdPath(input);
const positions = [...map.matchAll(/X/g)];
console.log(positions.length);
const start = input.indexOf('^');

const obstructions = positions.filter(({ index }) => {
  if (start === index) {
    return false;
  }

  try {
    markGaurdPath(`${input.slice(0, index)}#${input.slice(index + 1)}`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Stuck in a loop') {
      return true;
    } else {
      console.error(error);
    }
  }

  return false;
});

console.log(obstructions.length);
