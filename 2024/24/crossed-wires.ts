#!/usr/bin/env -S node -r ts-node/register

import EventEmitter from 'events';
import { readFileSync } from 'fs';
import { resolve } from 'path';

interface WireEvents {
  input: (wire: string) => void;
}

class WireEmitter extends EventEmitter {
  constructor(maxListeners: number) {
    super();
    this.setMaxListeners(maxListeners);
  }

  emit<Key extends keyof WireEvents>(
    event: Key,
    ...args: Parameters<WireEvents[Key]>
  ): boolean {
    return super.emit(event, ...args);
  }

  on<Key extends keyof WireEvents>(
    event: Key,
    listener: WireEvents[Key],
  ): this {
    return super.on(event, listener);
  }
}

class WireMap extends Map<string, boolean> {
  emitter: WireEmitter;

  constructor(maxListeners: number) {
    super();
    this.emitter = new WireEmitter(maxListeners);
  }

  set(key: string, value: boolean): this {
    super.set(key, value);
    this.emitter.emit('input', key);
    return this;
  }
}

type Logic = 'AND' | 'OR' | 'XOR';
type LogicFn = (x: boolean, y: boolean) => boolean;

const logicFunctions: Record<Logic, LogicFn> = {
  AND: (x, y) => x && y,
  OR: (x, y) => x || y,
  XOR: (x, y) => (x && !y) || (!x && y),
};

interface GateParams {
  inputs: [string, string];
  output: string;
  logic: Logic;
  map: WireMap;
}

class Gate extends EventEmitter {
  inputs: [string, string];
  logic: Logic;
  output: string;
  value?: boolean;
  private logicFn: LogicFn;
  private map: WireMap;

  constructor({ inputs, output, logic, map }: GateParams) {
    super();
    this.inputs = inputs;
    this.output = output;
    this.logic = logic;
    this.logicFn = logicFunctions[logic];
    this.map = map;

    this.map.emitter.on('input', (wire) => {
      if (
        (wire === this.inputs[0] && this.map.has(this.inputs[1])) ||
        (wire === this.inputs[1] && this.map.has(this.inputs[0]))
      ) {
        this.run();
      }
    });
  }

  run(): void {
    this.map.set(
      this.output,
      this.logicFn(
        this.map.get(this.inputs[0]) ?? false,
        this.map.get(this.inputs[1]) ?? false,
      ),
    );
  }
}

class System {
  inputStrings: string[];
  gates: Gate[];
  wires: WireMap;

  constructor(input: string) {
    const [inputStrings, gateStrings] = input
      .split('\n\n')
      .map((half) => half.split('\n'));

    this.inputStrings = inputStrings;
    this.wires = new WireMap(gateStrings.length);
    this.gates = [];

    gateStrings.forEach((gateString) => {
      const [, input1, logic, input2, output] =
        /(\w+)\s+(AND|OR|XOR)\s+(\w+)\s+->\s+(\w+)/.exec(gateString) ?? [];

      if (logic === 'AND' || logic === 'OR' || logic === 'XOR') {
        this.gates.push(
          new Gate({
            inputs: [input1, input2],
            output,
            logic,
            map: this.wires,
          }),
        );
      }
    });
  }

  run() {
    this.inputStrings.forEach((inputString) => {
      const [, wire, value] = /(\w+):\s+(0|1)/.exec(inputString) ?? [];
      this.wires.set(wire, value === '1');
    });
  }

  getValue(bitKey: string): number {
    const bits = [...this.wires.keys()]
      .filter((wire) => wire.startsWith(bitKey))
      .toSorted()
      .reverse()
      .map((wire) => (this.wires.get(wire) ? '1' : '0'))
      .join('');

    return parseInt(bits, 2);
  }
}

function getOutput(input: string): number {
  const system = new System(input);
  system.run();
  return system.getValue('z');
}

function getCrossedWires(input: string): string {
  const crossedWires = new Set<string>();
  const system = new System(input);

  const inputGates = system.gates.filter(
    (gate) =>
      (gate.inputs[0].startsWith('x') && gate.inputs[1].startsWith('y')) ||
      (gate.inputs[0].startsWith('y') && gate.inputs[1].startsWith('x')),
  );

  inputGates.forEach((gate) => {
    const bit = gate.inputs[0].slice(1);

    if (bit === '00' && gate.logic === 'XOR' && gate.output !== 'z00') {
      crossedWires.add(gate.output);
      crossedWires.add('z00');
    } else if (
      (bit !== '00' || gate.logic === 'AND') &&
      gate.output.startsWith('z')
    ) {
      crossedWires.add(gate.output);
    }
  });

  system.gates
    .filter((gate) => gate.output.startsWith('z') && gate.output !== 'z45')
    .forEach((gate) => {
      if (gate.logic !== 'XOR') {
        crossedWires.add(gate.output);
      }
    });

  inputGates
    .filter((gate) => gate.inputs[0].slice(1) !== '00' && gate.logic === 'XOR')
    .forEach((gate) => {
      const carry = system.gates.find(
        (carryGate) =>
          carryGate.logic === 'XOR' && carryGate.inputs.includes(gate.output),
      );

      if (!carry) {
        crossedWires.add(gate.output);
      } else if (!carry.output.startsWith('z')) {
        crossedWires.add(carry.output);
      }
    });

  const orGates = system.gates.filter((gate) => gate.logic === 'OR');

  system.gates
    .filter((gate) => gate.inputs[0].slice(1) !== '00' && gate.logic === 'AND')
    .forEach((gate) => {
      if (!orGates.some((orGate) => orGate.inputs.includes(gate.output))) {
        crossedWires.add(gate.output);
      }
    });

  return [...crossedWires].toSorted().join(',');
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
console.log(getOutput(input));
console.log(getCrossedWires(input));
