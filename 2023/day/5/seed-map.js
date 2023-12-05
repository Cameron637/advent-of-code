#!/usr/bin/env node
'use strict';

const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const parseMap = function parseMap(mapText) {
    const [nameText, ...rangesText] = mapText.split('\n');
    const name = nameText.replace(':', '');

    return {
        [name]: rangesText.map(
            (rangeText) => rangeText.split(' ').map((num) => parseInt(num, 10)),
        ),
    };
};

const parseSeeds = function parseSeeds(seedsText) {
    return seedsText
        .replace('seeds: ', '')
        .split(' ')
        .map((seed) => parseInt(seed, 10));
};

const parse = function parse(input) {
    const [seedsText, ...mapsText] = input.split('\n\n');

    return {
        seeds: parseSeeds(seedsText),
        maps: mapsText.reduce(
            (maps, mapText) => ({
                ...maps,
                ...parseMap(mapText),
            }),
            {},
        ),
    };
};

const useMap = function useMap(map, key) {
    const range = map.find(([destStart, srcStart, length]) => (
        key >= srcStart && key <= srcStart + length
    ));

    return range ? range[0] + (key - range[1]) : key;
};

const findLowestLocation = function findLowestLocation({ seeds, maps }) {
    const seedToLocationMap = seeds.reduce(
        (map, seed) => {
            const soil = useMap(maps['seed-to-soil map'], seed);
            const fertilizer = useMap(maps['soil-to-fertilizer map'], soil);
            const water = useMap(maps['fertilizer-to-water map'], fertilizer);
            const light = useMap(maps['water-to-light map'], water);
            const temp = useMap(maps['light-to-temperature map'], light);
            const humidity = useMap(maps['temperature-to-humidity map'], temp);
            const location = useMap(maps['humidity-to-location map'], humidity);
            map[seed] = location;
            return map;
        },
        {},
    );

    return Math.min(...Object.values(seedToLocationMap));
};

const input = readFileSync(resolve(join(__dirname, 'input')), 'utf-8');
const seedInfo = parse(input);
console.log(findLowestLocation(seedInfo));
