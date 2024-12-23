#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

function mix(secret: bigint, result: bigint): bigint {
  return secret ^ result;
}

function prune(secret: bigint): bigint {
  return secret % 16777216n;
}

type Step = (secret: bigint) => bigint;

function regenerate(secret: bigint): bigint {
  const steps: Step[] = [(x) => x * 64n, (x) => x / 32n, (x) => x * 2048n];

  return steps.reduce(
    (result, step) => prune(mix(result, step(result))),
    secret,
  );
}

function regenerateTimes(secret: bigint, times: number): bigint {
  let newSecret = secret;

  for (let i = 0; i < times; i++) {
    newSecret = regenerate(newSecret);
  }

  return newSecret;
}

function getPrice(secret: bigint): number {
  return Number(secret % 10n);
}

function findMostBananas(
  secrets: bigint[],
  times: number,
  size: number,
): number {
  const buyers: Record<string, number>[] = [];
  const sequences: number[][] = [];
  let newSecrets = secrets;

  for (let i = 0; i < times; i++) {
    const prices = newSecrets.map((secret) => getPrice(secret));
    newSecrets = newSecrets.map((secret) => regenerate(secret));
    const newPrices = newSecrets.map((secret) => getPrice(secret));
    const changes = prices.map((price, index) => newPrices[index] - price);

    changes.forEach(
      (change, index) =>
        (sequences[index] = sequences[index]
          ? [...sequences[index], change]
          : [change]),
    );

    if (i >= size) {
      sequences.forEach((sequence, index) => {
        sequence.shift();
        const key = sequence.join(',');

        if (!buyers[index]) {
          buyers[index] = {};
        }

        if (!buyers[index][key]) {
          buyers[index][key] = newPrices[index];
        }
      });
    }
  }

  const bananas = buyers.reduce((countMap: Record<string, number>, buyer) => {
    Object.entries(buyer).forEach(([sequence, price]) => {
      countMap[sequence] = (countMap[sequence] ?? 0) + price;
    });

    return countMap;
  }, {});

  return Math.max(...Object.values(bananas));
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const secrets = input.split('\n').map((secret) => BigInt(secret));
const regenerated = secrets.map((secret) => regenerateTimes(secret, 2000));
const regeneratedSum = regenerated.reduce((sum, secret) => sum + secret, 0n);
console.log(regeneratedSum);
console.log(findMostBananas(secrets, 2000, 4));
