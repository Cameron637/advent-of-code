#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

const equations: [string, string][] = input.split('\n').map((line) => {
  const [testValue, operands] = line.split(': ');
  return [testValue, operands];
});

const allowedOperators = ['+', '*', '||'] as const;
type Operator = (typeof allowedOperators)[number];
type Operation = (x: string, y: string) => string;

const operations: Record<Operator, Operation> = {
  '+': (x, y) => `${parseInt(x, 10) + parseInt(y, 10)}`,
  '*': (x, y) => `${parseInt(x, 10) * parseInt(y, 10)}`,
  '||': (x, y) => `${x}${y}`,
};

function getCalibrationResult(operators: Operator[]): number {
  const validEquations = equations.filter(([testValue, operands]) => {
    const operatorSpots = [...operands.matchAll(/\s/g)];
    const numOperators = operatorSpots.length;
    const combinations: Operator[][] = [];

    const generateCombinations = (combination: Operator[], position = 0) => {
      if (position === combination.length) {
        combinations.push([...combination]);
      } else {
        operators.forEach((operator) => {
          combination[position] = operator;
          generateCombinations(combination, position + 1);
        });
      }
    };

    generateCombinations(Array.from({ length: numOperators }));

    return combinations.some((combination) => {
      const stack = operands.split(' ').reverse();

      for (const operator of combination) {
        const x = stack.pop() ?? '';
        const y = stack.pop() ?? '';
        const result = operations[operator](x, y);
        stack.push(result);
      }

      return stack.pop() === testValue;
    });
  });

  const calibrationResult = validEquations.reduce(
    (sum, [testValue]) => sum + parseInt(testValue, 10),
    0,
  );

  return calibrationResult;
}

console.log(getCalibrationResult(allowedOperators.slice(0, 2)));
console.log(getCalibrationResult([...allowedOperators]));
