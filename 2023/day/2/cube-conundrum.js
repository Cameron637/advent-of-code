#!/usr/bin/env node
'use strict';

const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const parseGameData = function parseGameData(input) {
    const lines = input.split('\n');

    return lines.reduce(
        (gameMap, line) => {
            const [game, sets] = line.split(':');
            const id = game.replace('Game ', '');

            gameMap[id] = sets.split(';').map(
                (set) => set.split(',').reduce(
                    (valueMap, valueEntry) => {
                        const [value, key] = valueEntry.trim().split(' ');
                        valueMap[key] = parseInt(value, 10);
                        return valueMap;
                    },
                    { blue: 0, green: 0, red: 0 },
                ),
            );

            return gameMap;
        },
        {},
    );
};

const possibleGamesSum = function possibleGamesSum(gameData) {
    const possibleGames = Object.keys(gameData).filter(
        (id) => gameData[id].every(
            ({ blue, green, red }) => blue <= 14 && green <= 13 && red <= 12,
        ),
    );

    return possibleGames.reduce((sum, id) => sum += parseInt(id, 10), 0);
};

const powerSum = function powerSum(gameData) {
    const leastSets = Object.values(gameData).map((game) => game.reduce(
        (leastSet, set) => ({
            blue: Math.max(leastSet.blue, set.blue),
            green: Math.max(leastSet.green, set.green),
            red: Math.max(leastSet.red, set.red),
        }),
        { blue: 0, green: 0, red: 0 },
    ));

    return leastSets.reduce(
        (sum, set) => sum += set.blue * set.green * set.red,
        0,
    );
};

const input = readFileSync(resolve(join(__dirname, 'input')), 'utf-8');
const gameData = parseGameData(input);
console.log(possibleGamesSum(gameData), powerSum(gameData));
