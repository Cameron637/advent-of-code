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
    const seeds = [];

    const seedRanges = seedsText
        .replace('seeds: ', '')
        .split(' ')
        .map((seed) => parseInt(seed, 10));

    for (let i = 0; i < seedRanges.length - 1; i += 2) {
        const rangeStart = seedRanges[i];
        const rangeLength = seedRanges[i + 1];
        seeds.push({ rangeStart, rangeLength });
    }

    return seeds;
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

const useMapReverse = function useMapReverse(map, key) {
    const range = map.find(([destStart, srcStart, length]) => (
        key >= destStart && key <= destStart + length
    ));

    return range ? range[1] + (key - range[0]) : key;
};

const hasSeed = function hasSeed(maps, location, seeds) {
    const humidity = useMapReverse(maps['humidity-to-location map'], location);
    const temp = useMapReverse(maps['temperature-to-humidity map'], humidity);
    const light = useMapReverse(maps['light-to-temperature map'], temp);
    const water = useMapReverse(maps['water-to-light map'], light);
    const fertilizer = useMapReverse(maps['fertilizer-to-water map'], water);
    const soil = useMapReverse(maps['soil-to-fertilizer map'], fertilizer);
    const seed = useMapReverse(maps['seed-to-soil map'], soil);

    return seeds.some(({ rangeStart, rangeLength }) => (
        seed >= rangeStart && seed <= rangeStart + rangeLength
    ));
};

const findLowestLocation = function findLowestLocation({ seeds, maps }) {
    let location;

    const sortedLocations = maps['humidity-to-location map']
        .sort((a, b) => a[0] - b[0]);

    sortedLocations.find(([rangeStart, srcRangeStart, length]) => {
        const rangeEnd = rangeStart + length;

        for (let i = rangeStart; i < rangeEnd; ++i) {
            if (hasSeed(maps, i, seeds)) {
                location = i;
                return true;
            }
        }

        return false;
    });

    return location;
};

const input = readFileSync(resolve(join(__dirname, 'input')), 'utf-8');
const seedInfo = parse(input);
console.log(findLowestLocation(seedInfo));
