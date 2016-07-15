'use strict';

// TODO: Externalize (CJP)
const SECONDS_IN_MIN = 60;
const SECONDS_IN_HOUR = 60 * SECONDS_IN_MIN;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
const SECONDS_IN_MONTH = 30 * SECONDS_IN_DAY; // NOTE: Not precise by definition (CJP)
const SECONDS_IN_YEAR = 365 * SECONDS_IN_MONTH; // NOTE: Not precise by definition (CJP)

const toSecondsMap = [
    SECONDS_IN_YEAR,
    SECONDS_IN_MONTH,
    SECONDS_IN_DAY,
    SECONDS_IN_HOUR,
    SECONDS_IN_MIN,
    1
];

const getRegExp = () => /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d*\.?\d+)S)?)?/;

const toDuration = (str) => {
    const matches = getRegExp().exec(str);
    if (!matches) { return undefined; }
    return Array.from(matches)
        .slice(1)
        .map(val => val || 0)
        .reduce((acc, val, i) => acc + (val * toSecondsMap[i]), 0);
};

export default { toDuration };