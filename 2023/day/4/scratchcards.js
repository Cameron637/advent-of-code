#!/usr/bin/env node
'use strict';

const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const getNumbersFromText = function getNumbersFromText(numbersText) {
    return numbersText.split(/\s+/).map((number) => parseInt(number, 10));
};

const parseCards = function parseCards(input) {
    const lines = input.split('\n');

    return lines.map((line) => {
        const [winningNumbers, numbers] = line.replace(/Card\s+\d+:\s+/, '')
            .split(/\s*\|\s*/)
            .map((text) => getNumbersFromText(text));

        return {
            winningNumbers,
            numbers,
            copies: 1,
        };
    });
};

const calculatePoints = function calculatePoints(cards) {
    return cards.reduce(
        (sum, { winningNumbers, numbers }) => {
            const points = numbers.reduce(
                (currentPoints, number) => {
                    const isWinningNumber = winningNumbers.includes(number);

                    if (isWinningNumber && currentPoints > 0) {
                        return currentPoints * 2;
                    } else if (isWinningNumber) {
                        return currentPoints + 1;
                    }

                    return currentPoints;
                },
                0,
            );

            return sum + points;
        },
        0,
    );
};

const countScratchcards = function countScratchcards(cards) {
    cards.forEach(({ winningNumbers, numbers, copies }, index) => {
        const wins = numbers.filter(
            (number) => winningNumbers.includes(number),
        );

        const cardsToCopy = wins.map((x, i) => index + i + 1);

        cardsToCopy.forEach((card) => {
            if (card < cards.length) {
                cards[card].copies += copies;
            }
        });
    });

    console.log(cards);
    return cards.reduce((sum, { copies }) => sum + copies, 0);
};

const input = readFileSync(resolve(join(__dirname, 'input')), 'utf-8');
const cards = parseCards(input);
console.log(calculatePoints(cards), countScratchcards(cards));
