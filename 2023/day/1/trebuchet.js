#!/usr/bin/env node
'use strict';

const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const DIGIT_MAP = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
};

const DIGITS = Object.keys(DIGIT_MAP);

const findFirstDigit = function findFirstDigit(line) {
    const digitIndexes = DIGITS.reduce((map, digit) => {
        const index = line.indexOf(digit);
        if (index !== -1) map[index] = digit;
        return map;
    }, {});

    return digitIndexes[Math.min(...Object.keys(digitIndexes))];
};

const findLastDigit = function findLastDigit(line) {
    const digitIndexes = DIGITS.reduce((map, digit) => {
        const index = line.lastIndexOf(digit);
        if (index !== -1) map[index] = digit;
        return map;
    }, {});

    return digitIndexes[Math.max(...Object.keys(digitIndexes))];
};

const getCalibrationSum = function getCalibrationSum(input) {
    const lines = input.split('\n');

    return lines.reduce((sum, line) => {
        const firstDigit = DIGIT_MAP[findFirstDigit(line)];
        const lastDigit = DIGIT_MAP[findLastDigit(line)];
        return sum + parseInt(`${firstDigit}${lastDigit}`, 10);
    }, 0);
};

const input = readFileSync(resolve(join(__dirname, 'input')), 'utf-8');
console.log(getCalibrationSum(input));
