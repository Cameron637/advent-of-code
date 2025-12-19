#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import Graph from 'graphology';
import { allSimplePaths } from 'graphology-simple-path';
import { resolve } from 'path';

function parseInput(input: string): Graph {
  const graph = new Graph();

  const matches = input.matchAll(
    /^(?<device>[a-z]{3}): (?<outputs>(?:[a-z]{3} ?)+)$/gm,
  );

  for (const match of matches) {
    const device = match.groups!.device;
    const outputs = match.groups!.outputs;
    graph.mergeNode(device);
    const outputMatches = outputs.matchAll(/(?:(?<output>[a-z]{3}))/g);

    for (const outputMatch of outputMatches) {
      const output = outputMatch.groups!.output;
      graph.mergeNode(output);
      graph.mergeEdge(device, output);
    }
  }

  return graph;
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const graph = parseInput(input);
console.log(allSimplePaths(graph, 'you', 'out').length);
const paths = allSimplePaths(graph, 'svr', 'out', { maxDepth: 20 });

console.log(
  paths.filter((path) => path.includes('dac') && path.includes('fft')).length,
);
