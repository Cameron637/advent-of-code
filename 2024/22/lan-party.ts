#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

function getConnections(input: string): Record<string, string[]> {
  return input
    .split('\n')
    .reduce((connections: Record<string, string[]>, connection) => {
      const [computer1, computer2] = connection.split('-');

      connections[computer1] = connections[computer1]
        ? [...connections[computer1], computer2]
        : [computer2];

      connections[computer2] = connections[computer2]
        ? [...connections[computer2], computer1]
        : [computer1];

      return connections;
    }, {});
}

function getThrouples(connectionsMap: Record<string, string[]>): Set<string> {
  return Object.entries(connectionsMap).reduce(
    (throuples, [computer, connections]) => {
      connections.forEach((connection) => {
        const thirds = connectionsMap[connection].filter((third) =>
          connectionsMap[third].includes(computer),
        );

        thirds.forEach((third) => {
          const group = [computer, connection, third];
          const key = group.toSorted().join(',');
          throuples.add(key);
        });
      });

      return throuples;
    },
    new Set<string>(),
  );
}

function findLargestParty(
  connectionsMap: Record<string, string[]>,
  throuples: Set<string>,
): string {
  let candidates = [...throuples];

  while (candidates.length > 1) {
    const newCandidates = new Set<string>();

    candidates.forEach((candidate) => {
      const group = candidate.split(',');

      group.forEach((computer) => {
        const newPartyMember = connectionsMap[computer].find((connection) =>
          group.every((member) => connectionsMap[connection].includes(member)),
        );

        if (newPartyMember) {
          group.push(newPartyMember);
          newCandidates.add([...group].toSorted().join(','));
        }
      });
    });

    candidates = [...newCandidates];
  }

  return candidates[0];
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const connections = getConnections(input);
const throuples = getThrouples(connections);

console.log(
  [...throuples].filter((throuple) =>
    throuple.split(',').some((computer) => computer.startsWith('t')),
  ).length,
);

console.log(findLargestParty(connections, throuples));
