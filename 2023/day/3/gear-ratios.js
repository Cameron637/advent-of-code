#!/usr/bin/env node
'use strict';

const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const getMatchCoords = function getMatchCoords(lines, regex) {
    return lines.reduce(
        (coords, line, index) => {
            const matchCoords = Array.from(
                line.matchAll(regex),
                (match) => [index, match.index, match[0]],
            );

            return [...coords, ...matchCoords];
        },
        [],
    );
};

const isAdjacent = function isAdjacent(number, symbol) {
    const [numX, numStartY, num] = number;

    const numYRange = [...Array(num.length).fill(numStartY)].map(
        (x, i) => x + i,
    );

    const [symbolX, symbolY] = symbol;

    return (
        Math.abs(symbolX - numX) < 2 &&
        [symbolY - 1, symbolY, symbolY + 1].some(
            (y) => numYRange.includes(y),
        )
    );
};

const partsSum = function partsSum(input) {
    const lines = input.split('\n');
    const numbers = getMatchCoords(lines, /\d+/g);
    const symbols = getMatchCoords(lines, /[^a-zA-Z0-9.]/g);

    const parts = numbers.filter(
        (number) => symbols.some((symbol) => isAdjacent(number, symbol)),
    );

    const partNumbers = parts.map((part) => parseInt(part[2], 10));
    return partNumbers.reduce((sum, number) => sum + number, 0);
};

const gearRatioSum = function gearRatioSum(input) {
    const lines = input.split('\n');
    const numbers = getMatchCoords(lines, /\d+/g);
    const possibleGears = getMatchCoords(lines, /[*]/g);

    return possibleGears.reduce(
        (sum, possibleGear) => {
            const adjacentNumbers = numbers.filter(
                (number) => isAdjacent(number, possibleGear),
            );

            if (adjacentNumbers.length === 2) {
                const gearRatio = (
                    parseInt(adjacentNumbers[0][2], 10) *
                    parseInt(adjacentNumbers[1][2], 10)
                );

                return sum + gearRatio;
            }

            return sum;
        },
        0,
    );
};

const input = readFileSync(resolve(join(__dirname, 'input')), 'utf-8');
console.log(partsSum(input), gearRatioSum(input));
