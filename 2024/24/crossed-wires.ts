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
  output: string;
  value?: boolean;
  private logic: LogicFn;
  private map: WireMap;

  constructor({ inputs, output, logic, map }: GateParams) {
    super();
    this.inputs = inputs;
    this.output = output;
    this.logic = logicFunctions[logic];
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
      this.logic(
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

  getSwapKey(swapped: [Gate, Gate][]): string {
    return swapped
      .flatMap((gates) => gates.map(({ output }) => output))
      .toSorted()
      .join(',');
  }

  swapRandom(pairs: number, tried: Set<string>): [Gate, Gate][] {
    let swapped: [Gate, Gate][] = [];
    let swapKey = '';

    while (!swapKey || tried.has(swapKey)) {
      swapped = [];

      for (let i = 0; i < pairs; i++) {
        const random1 = this.getRandomGate(swapped.flat());
        const random2 = this.getRandomGate([...swapped.flat(), random1]);
        const output1 = random1.output;
        random1.output = random2.output;
        random2.output = output1;
        swapped.push([random1, random2]);
      }

      swapKey = this.getSwapKey(swapped);
    }

    return swapped;
  }

  private getRandomGate(selected: Gate[]): Gate {
    let random = this.gates[Math.floor(Math.random() * this.gates.length)];

    while (selected.includes(random)) {
      random = this.gates[Math.floor(Math.random() * this.gates.length)];
    }

    return random;
  }
}

function getOutput(input: string): number {
  const system = new System(input);
  system.run();
  return system.getValue('z');
}

function getCrossedWires(input: string): string {
  const tried = new Set<string>();
  let system = new System(input);
  let swapped = system.swapRandom(4, tried);
  system.run();

  while (system.getValue('x') + system.getValue('y') !== system.getValue('z')) {
    tried.add(system.getSwapKey(swapped));
    system = new System(input);
    swapped = system.swapRandom(4, tried);
    system.run();
  }

  return system.getSwapKey(swapped);
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
console.log(getOutput(input));
console.log(getCrossedWires(input));
