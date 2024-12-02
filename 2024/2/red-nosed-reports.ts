#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

const reports = input
  .trim()
  .split('\n')
  .map((line) => line.split(' ').map((level) => parseInt(level, 10)));

function isSafe(report: number[]): boolean {
  const increasing = report[1] > report[0];

  for (let i = 1; i < report.length; i++) {
    if (
      (increasing && report[i] <= report[i - 1]) ||
      (!increasing && report[i] >= report[i - 1]) ||
      Math.abs(report[i] - report[i - 1]) > 3
    ) {
      return false;
    }
  }

  return true;
}

function countSafeReports(problemDampener = false): number {
  return reports.reduce((count, report) => {
    let safe = isSafe(report);

    if (!safe && problemDampener) {
      const dampenedReports = report.map((_, index) => [
        ...report.slice(0, index),
        ...report.slice(index + 1),
      ]);

      safe = dampenedReports.some((dampenedReport) => isSafe(dampenedReport));
    }

    return safe ? count + 1 : count;
  }, 0);
}

console.log(countSafeReports());
console.log(countSafeReports(true));
