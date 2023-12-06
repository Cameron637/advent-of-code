#!/usr/bin/env node
'use strict';

const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const parse = function parse(input) {
    const [timeText, distanceText] = input.split('\n');
    const times = timeText.replace(/Time:\s+/, '').split(/\s+/);
    const distances = distanceText.replace(/Distance:\s+/, '').split(/\s+/);

    return times.map(
        (time, index) => [time, distances[index]].map((x) => parseInt(x, 10)),
    );
};

const parseV2 = function parseV2(input) {
    const [timeText, distanceText] = input.split('\n');
    const time = timeText.replace(/Time:/, '');
    const distance = distanceText.replace(/Distance:/, '');

    return [time, distance].map(
        (text) => parseInt(text.replaceAll(/\s+/g, ''), 10),
    );
};

const calculateWaysToWin = function calculateWaysToWin([time, distance]) {
    let waysToWin = 1;
    const optimal = Math.floor(time / 2);

    for (let i = optimal - 1; i > 0; --i) {
        const remaining = time - i;

        if (i * remaining > distance) {
            ++waysToWin;
        } else {
            break;
        }
    }

    for (let i = optimal + 1; i < time; ++i) {
        const remaining = time - i;

        if (i * remaining > distance) {
            ++waysToWin;
        } else {
            break;
        }
    }

    return waysToWin;
};

const numWaysToWin = function numWaysToWin(races) {
    return races.reduce(
        (totalWaysToWin, race) => {
            return totalWaysToWin * calculateWaysToWin(race);
        },
        1,
    );
};

const input = readFileSync(resolve(join(__dirname, 'input')), 'utf-8');
const races = parse(input);
const race = parseV2(input);
console.log(numWaysToWin(races), calculateWaysToWin(race));
