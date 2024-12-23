#!/usr/bin/env -S node -r ts-node/register

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { type Coordinate, toCoordinate } from '../../util/util';

function getTrack(input: string, map: string[]): Coordinate[] {
  const start = toCoordinate(
    map[0].length,
    input.replaceAll('\n', '').indexOf('S'),
  );

  const track: Coordinate[] = [start];
  let current = start;

  while (map[current[0]][current[1]] !== 'E') {
    const prev = track.length > 1 ? track[track.length - 2] : [];

    const directions: Coordinate[] = [
      [current[0] - 1, current[1]],
      [current[0] + 1, current[1]],
      [current[0], current[1] - 1],
      [current[0], current[1] + 1],
    ];

    const next = directions
      .filter(([row, col]) => row !== prev[0] || col !== prev[1])
      .find(([row, col]) => map[row][col] !== '#');

    if (!next) {
      return [];
    }

    track.push(next);
    current = next;
  }

  return track;
}

function countCheats(
  track: Coordinate[],
  maxCheatLength: number,
  savingsThreshold = 1,
): number {
  return track.reduce((count, start, index) => {
    const endPositions = track
      .slice(index + savingsThreshold + 2)
      .filter(
        (end) =>
          Math.abs(end[0] - start[0]) + Math.abs(end[1] - start[1]) <=
          maxCheatLength,
      );

    endPositions.forEach((end) => {
      const startIndex = track.findIndex(
        ([row, col]) => row === start[0] && col === start[1],
      );

      const endIndex = track.findIndex(
        ([row, col]) => row === end[0] && col === end[1],
      );

      const timeSaved =
        endIndex -
        startIndex -
        (Math.abs(end[0] - start[0]) + Math.abs(end[1] - start[1]));

      if (timeSaved >= savingsThreshold) {
        count++;
      }
    });

    return count;
  }, 0);
}

const input = readFileSync(resolve(__dirname, 'input'), 'utf-8');
const map = input.split('\n');
const track = getTrack(input, map);
console.log(countCheats(track, 2, 100));
console.log(countCheats(track, 20, 100));
