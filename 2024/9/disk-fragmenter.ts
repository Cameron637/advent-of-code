#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';

interface FileDescriptor {
  id: string;
  size: number;
}

function convertToDisk(descriptors: FileDescriptor[]): string[] {
  return descriptors.flatMap(({ id, size }) =>
    Array.from<string>({ length: size }).fill(id),
  );
}

function getFileDescriptors(input: string): FileDescriptor[] {
  return input.split('').reduce(
    (descriptors: FileDescriptor[], block, index) => [
      ...descriptors,
      {
        id: index % 2 ? '.' : `${index / 2}`,
        size: parseInt(block, 10),
      },
    ],
    [],
  );
}

function compactFragmented(disk: string[]): string[] {
  const compacted = [...disk];
  let firstFreeIndex = compacted.indexOf('.');
  let lastUsedIndex = compacted.findLastIndex((id) => id !== '.');

  while (firstFreeIndex < lastUsedIndex) {
    compacted[firstFreeIndex] = compacted[lastUsedIndex];
    compacted[lastUsedIndex] = '.';
    firstFreeIndex = compacted.indexOf('.');
    lastUsedIndex = compacted.findLastIndex((id) => id !== '.');
  }

  return compacted;
}

function checksum(disk: string[]): number {
  return disk.reduce(
    (sum, id, index) => (id === '.' ? sum : (sum += index * parseInt(id, 10))),
    0,
  );
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');

console.log(
  checksum(compactFragmented(convertToDisk(getFileDescriptors(input)))),
);

function compactContiguous(disk: FileDescriptor[]): FileDescriptor[] {
  let compacted = [...disk];

  for (let i = disk.length - 1; i > 1; i--) {
    while (i > 1 && compacted[i].id === '.') {
      i--;
    }

    const file = compacted[i];

    const freeIndex = compacted
      .slice(0, i)
      .findIndex(({ id, size }) => id === '.' && size >= file.size);

    if (freeIndex !== -1) {
      const free = compacted[freeIndex];
      const freeReplacements = [file];

      if (free.size > file.size) {
        free.size = free.size - file.size;
        freeReplacements.push(free);
      }

      const fileReplacement: FileDescriptor = {
        id: '.',
        size: file.size,
      };

      compacted = [
        ...compacted.slice(0, freeIndex),
        ...freeReplacements,
        ...compacted.slice(freeIndex + 1, i),
        ...[fileReplacement],
        ...compacted.slice(i + 1),
      ];
    }
  }

  return compacted;
}

console.log(
  checksum(convertToDisk(compactContiguous(getFileDescriptors(input)))),
);
