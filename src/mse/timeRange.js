'use strict';

// TODO: use IoC for deps (CJP)
import { lte, gte } from '../math/compare';

const toArray = timeRanges => {
    return Array.from(
        timeRanges,
        (v, i) => [ timeRanges.start(i), timeRanges.end(i) ]
    );
};

// TODO: Move me? (not specific to timeRange) (CJP)
// TODO: Refactor to higher order for pt or impl simple partial? (CJP)
const containsPoint = (pt, start, end, tol = 0) => {
    return gte(pt, start, tol) && lte(pt, end, tol);
};

const isTouching = (xStart, xEnd, yStart, yEnd, tol) => {
    return containsPoint(xStart, yStart, yEnd, tol) ||
        containsPoint(xEnd, yStart, yEnd, tol);
};

const toUnitPrecision = unit => x => Math.round(x/unit) * unit;
const rangeAlignedTo = unit => range => range.map(toUnitPrecision(unit));
const touchingMerged = (rangeA, rangeB) => {
    if (!isTouching(...rangeA, ...rangeB)) { return [rangeA, rangeB]; }
    return [[rangeA[0], rangeB[1]]];
};

const mergedRangesReducer = (ranges, range) => {
    if (!ranges || ranges.length === 0 || ranges === range) { return [range]; }
    return [
        ...ranges.slice(0, ranges.length-1),
        ...touchingMerged(ranges[ranges.length-1], range)
    ];
};

const toCurrentRange = t => rs => rs.find(r => containsPoint(t, ...r));

const toNormalizedRanges = duration => {
    const toAligned = rangeAlignedTo(duration);
    return ranges => {
        return toArray(ranges)
            .map(toAligned)
            .reduce(mergedRangesReducer, []);
    };
};

export { containsPoint, mergedRangesReducer, rangeAlignedTo, toArray, toUnitPrecision, toCurrentRange, toNormalizedRanges };