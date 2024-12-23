#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

const registerIds = ['A', 'B', 'C'] as const;
type RegisterId = (typeof registerIds)[number];

function getRegisterValue(input: string, id: RegisterId): number {
  const match = new RegExp(`Register\\s+${id}:\\s+(\\d+)`).exec(input);
  return match ? parseInt(match[1], 10) : 0;
}

function getProgram(input: string): string {
  const [match] = /Program:\s+(\d,?)+/.exec(input) ?? [''];
  const [, program] = match.split(/\s+/);
  return program;
}

type Instruction = [number, number];

function getInstructions(program: string): Instruction[] {
  const values = program.split(',').map((value) => parseInt(value, 10));
  const instructions: Instruction[] = [];

  for (let i = 0; i < values.length; i += 2) {
    const instruction: Instruction = [values[i], values[i + 1]];
    instructions.push(instruction);
  }

  return instructions;
}

interface Program {
  registers: Record<RegisterId, number>;
  instructions: Instruction[];
}

function run(program: Program): string {
  const { registers, instructions } = program;
  const output: number[] = [];
  let index = 0;
  let jumped = false;

  function getCombo(operand: number): number {
    if (operand === 4) {
      return registers.A;
    } else if (operand === 5) {
      return registers.B;
    } else if (operand === 6) {
      return registers.C;
    }

    return operand;
  }

  function getDivision(operand: number): number {
    return Math.floor(registers.A / 2 ** getCombo(operand));
  }

  type Operation = (operand: number) => void;

  const operations: Record<number, Operation> = {
    0: (operand) => {
      registers.A = getDivision(operand);
    },
    1: (operand) => {
      registers.B = registers.B ^ operand;
    },
    2: (operand) => {
      registers.B = getCombo(operand) % 8;
    },
    3: (operand) => {
      if (registers.A !== 0) {
        index = Math.floor(operand / 2);
        jumped = true;
      }
    },
    4: () => {
      registers.B = registers.B ^ registers.C;
    },
    5: (operand) => {
      output.push(getCombo(operand) % 8);
    },
    6: (operand) => {
      registers.B = getDivision(operand);
    },
    7: (operand) => {
      registers.C = getDivision(operand);
    },
  };

  while (index < instructions.length) {
    const [opcode, operand] = instructions[index];
    operations[opcode](operand);

    if (!jumped) {
      index++;
    } else {
      jumped = false;
    }
  }

  return output.join(',');
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

const registers = registerIds.reduce(
  (record, id) => {
    record[id] = getRegisterValue(input, id);
    return record;
  },
  {
    A: 0,
    B: 0,
    C: 0,
  },
);

const programString = getProgram(input);
const instructions: Instruction[] = getInstructions(programString);
const program = { registers, instructions };
let output = run(program);
console.log(output);
let A = 0;

while (output !== programString) {
  A++;
  output = run({ ...program, registers: { ...registers, A } });
}

console.log(A);
