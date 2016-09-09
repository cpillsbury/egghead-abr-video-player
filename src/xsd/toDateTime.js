'use strict';

// TODO: Externalize (CJP)
const MILLISECONDS_IN_SECONDS = 1000;
const SECONDS_IN_MIN = 60;
const SECONDS_IN_HOUR = 60 * SECONDS_IN_MIN;

const getRegExp = () => /^(?:(\d{4})-?(\d{2})-?(\d{2}))(?:T(\d{2}):?(\d{2}):?(\d{2})(?:\.(\d{3}))?(?:Z|([+-])(\d{2})(?::?(\d{2}))?)?)?$/;

const getTimeZoneOffset = (sign = '+', hours = 0, minutes = 0) => {
    return (sign + MILLISECONDS_IN_SECONDS) *
        ((hours * SECONDS_IN_HOUR) + (minutes * SECONDS_IN_MIN));
};

const toDateTime = (str) => {
    const matches = getRegExp().exec(str);
    if (!matches) { return undefined; }
    const matchesArray = Array.from(matches);
    const utcArray = [
        matchesArray[1],
        matchesArray[2]-1,  // Handles 0-index months for UTC (CJP)
        ...matchesArray.slice(3,8)
    ].map(i => i || 0); // Ensure 0 for potentially undefined values (caused by group selectors) (CJP)
    const utc = Date.UTC(...utcArray);
    const offset = getTimeZoneOffset(...(matchesArray.slice(8)));
    return new Date(utc+offset);
};

export { toDateTime };
export default toDateTime;
