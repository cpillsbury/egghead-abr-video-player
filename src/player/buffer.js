'use strict';
import { Observable } from 'rxjs';
import { timeToNextSegment } from '../buffer/timeToNextSegment';

const not = fn => (...args) => !fn(...args);
const strictEquality = (a, b) => a === b;
const compareAtIndex = (compare = strictEquality) => (arr = []) => (v, i) => {
    return compare(v, arr[i]);
};
const areArraysEqual = (compare = strictEquality) => (a = [], b = []) => {
    // TODO: Handle nonexistence cases instead of defaulting? (CJP)
    return (a.length === b.length) && !a.find(not(compareAtIndex(compare)(b)));
};

const bufferData = (playbackTime$, buffered$, playbackRate$, rtt$, segmentDuration$) => {
    return Observable.combineLatest(
        playbackTime$,
        buffered$,
        playbackRate$,
        rtt$,
        segmentDuration$,
        (playbackTime, buffered, playbackRate, rtt, segmentDuration) => {
            return { playbackTime, buffered, playbackRate, rtt, segmentDuration };
        })
        .distinctUntilChanged(
            undefined,
            (a, b) => {
                // TODO: Implement rtt shit (CJP)
                return (a.playbackTime === b.playbackTime) &&
                    (a.playbackRate === b.playbackRate) &&
                    (a.segmentDuration === b.segmentDuration) &&
                    areArraysEqual(areArraysEqual())(a.buffered, b.buffered);
            }
        );
};

const bufferEngine = (bufferData$) => {

};

export default bufferEngine;
export { bufferEngine, bufferData }