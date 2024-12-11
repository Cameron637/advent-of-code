#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

function slice(stone: string): [string, string] {
  return [
    stone.slice(0, stone.length / 2),
    stone.slice(stone.length / 2).replace(/^0+/, '') || '0',
  ];
}

function blink(input: string, times: number): number {
  let stones = input.split(' ');

  for (let i = 0; i < times; i++) {
    stones = stones.flatMap((stone) => {
      if (stone === '0') {
        return '1';
      } else if (stone.length % 2 === 0) {
        return slice(stone);
      } else {
        return `${parseInt(stone, 10) * 2024}`;
      }
    });
  }

  return stones.length;
}

function blinkLarge(input: string, times: number): number {
  let stones = input
    .split(' ')
    .reduce((counts: Record<string, number>, stone) => {
      counts[stone] = counts[stone] ? counts[stone] + 1 : 1;
      return counts;
    }, {});

  for (let i = 0; i < times; i++) {
    const newStones: Record<string, number> = {};

    const add = (stone: string, count: number): void => {
      newStones[stone] = newStones[stone] ? newStones[stone] + count : count;
    };

    if (stones['0']) {
      add('1', stones['0']);
    }

    Object.keys(stones)
      .filter((stone) => stone.length % 2 === 0)
      .forEach((stone) => {
        const [key1, key2] = slice(stone);
        add(key1, stones[stone]);
        add(key2, stones[stone]);
      });

    Object.keys(stones)
      .filter((stone) => stone.length % 2 && stone !== '0')
      .forEach((stone) => add(`${parseInt(stone, 10) * 2024}`, stones[stone]));

    stones = newStones;
  }

  return Object.values(stones).reduce((sum, count) => sum + count, 0);
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
console.log(blink(input, 25));
console.log(blinkLarge(input, 75));
