#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { init } from 'z3-solver';

interface Machine {
  buttons: number[][];
  indicatorLights: boolean[];
  indicatorLightsDiagram: boolean[];
  joltage: number[];
  joltageRequirements: number[];
}

function findFewestButtonPresses(machine: Machine): number {
  const targetKey = machine.indicatorLightsDiagram
    .map((light) => (light ? 1 : 0))
    .join('');

  const memo = new Set<string>();

  let currentStates = new Set<string>([
    machine.indicatorLights.map((light) => (light ? 1 : 0)).join(''),
  ]);

  if (currentStates.has(targetKey)) {
    return 0;
  }

  let presses = 0;

  while (currentStates.size > 0) {
    presses++;
    const nextStates = new Set<string>();

    for (const stateKey of currentStates) {
      if (memo.has(stateKey)) {
        continue;
      }

      memo.add(stateKey);
      const currentLights = stateKey.split('').map((bit) => bit === '1');

      for (const button of machine.buttons) {
        const newLights = currentLights.map((light, index) =>
          button.includes(index) ? !light : light,
        );

        const newStateKey = newLights.map((light) => (light ? 1 : 0)).join('');

        if (newStateKey === targetKey) {
          return presses;
        }

        if (!memo.has(newStateKey)) {
          nextStates.add(newStateKey);
        }
      }
    }

    currentStates = nextStates;
  }

  return -1;
}

async function findFewestButtonPressesJoltage(
  machine: Machine,
): Promise<number> {
  const { Context } = await init();
  const { Solver, Int, Sum, Eq } = Context('joltage');
  const solver = new Solver();
  const buttonPresses = machine.buttons.map((_, i) => Int.const(`button_${i}`));

  for (const buttonPress of buttonPresses) {
    solver.add(buttonPress.ge(0));
  }

  for (
    let counterIndex = 0;
    counterIndex < machine.joltageRequirements.length;
    counterIndex++
  ) {
    const effects = [];

    for (
      let buttonIndex = 0;
      buttonIndex < machine.buttons.length;
      buttonIndex++
    ) {
      const button = machine.buttons[buttonIndex];

      if (button.includes(counterIndex)) {
        effects.push(buttonPresses[buttonIndex]);
      }
    }

    const totalEffect =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-spread
      effects.length > 0 ? (Sum as any).apply(null, effects) : Int.val(0);

    solver.add(Eq(totalEffect, machine.joltageRequirements[counterIndex]));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-spread
  const totalPresses = (Sum as any).apply(null, buttonPresses);
  const result = await solver.check();

  if (result !== 'sat') {
    return -1;
  }

  let low = 0;
  let high = machine.joltageRequirements.reduce((sum, req) => sum + req, 0);
  let minPresses = high;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testSolver = new Solver();

    for (const buttonPress of buttonPresses) {
      testSolver.add(buttonPress.ge(0));
    }

    for (
      let counterIndex = 0;
      counterIndex < machine.joltageRequirements.length;
      counterIndex++
    ) {
      const effects = [];

      for (
        let buttonIndex = 0;
        buttonIndex < machine.buttons.length;
        buttonIndex++
      ) {
        const button = machine.buttons[buttonIndex];

        if (button.includes(counterIndex)) {
          effects.push(buttonPresses[buttonIndex]);
        }
      }

      const totalEffect =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-spread
        effects.length > 0 ? (Sum as any).apply(null, effects) : Int.val(0);

      testSolver.add(
        Eq(totalEffect, machine.joltageRequirements[counterIndex]),
      );
    }

    testSolver.add(totalPresses.le(mid));

    const testResult = await testSolver.check();
    if (testResult === 'sat') {
      minPresses = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return minPresses;
}

function parseInput(input: string): Machine[] {
  const matches = input.matchAll(
    /^\[(?<indicatorLightsDiagram>[.#]+)\](?<buttons>(?:\s*\((?:\d+,?)+\)\s*)+)\{(?<joltageRequirements>(?:\d+,?)+)\}$/gm,
  );

  return [
    ...matches.map(({ groups }) => {
      const buttonMatches = groups!.buttons.matchAll(
        /\((?<button>(?:\d+,?)+)\)/g,
      );

      const buttons = [
        ...buttonMatches.map((match) =>
          match.groups!.button.split(',').map((x) => parseInt(x, 10)),
        ),
      ];

      const indicatorLightsDiagram = groups!.indicatorLightsDiagram
        .split('')
        .map((value) => (value === '#' ? true : false));

      const joltageRequirements = groups!.joltageRequirements
        .split(',')
        .map((x) => parseInt(x, 10));

      return {
        buttons,
        indicatorLights: Array.from(
          { length: indicatorLightsDiagram.length },
          () => false,
        ),
        indicatorLightsDiagram,
        joltage: Array.from({ length: joltageRequirements.length }, () => 0),
        joltageRequirements,
      };
    }),
  ];
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const machines = parseInput(input);

const fewest = machines.reduce(
  (sum, machine) => sum + findFewestButtonPresses(machine),
  0,
);

console.log(fewest);

(async () => {
  const joltageResults = await Promise.all(
    machines.map((machine) => findFewestButtonPressesJoltage(machine)),
  );

  const fewestJoltage = joltageResults.reduce((sum, result) => sum + result, 0);
  console.log(fewestJoltage);
})();
