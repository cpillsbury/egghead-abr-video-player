'use strict';
import { existy } from '../fp/fp';
import { toNormalizedRanges, toCurrentRange } from '../mse/mse';
import timeToNextSegment from './timeToNextSegment';

// TODO: Move me! (CJP)
const toUnitPrecisionFloor = unit => x => Math.floor(x/unit) * unit;
const toSegmentTime = ({ currentRange, segmentDuration, playheadTime }) => {
    const baseTime = currentRange ?
        currentRange[1] :
        toUnitPrecisionFloor(segmentDuration)(playheadTime);
    return baseTime + (segmentDuration / 2);
};

const toMediaBufferResult = ({
    buffered,
    playheadTime,
    playbackRate,
    lastRTT,
    segmentDuration,
    segments,
    minDesiredBufferSize,
    maxDesiredBufferSize
}) => {
    const normalizedBuffer = toNormalizedRanges(segmentDuration)(buffered);
    const currentRange = toCurrentRange(playheadTime)(normalizedBuffer);
    const bufferSize = currentRange ? currentRange[1] - playheadTime : 0;
    const waitTime = timeToNextSegment({
        lastRTT,
        bufferSize,
        segmentDuration,
        playbackRate,
        minDesiredBufferSize,
        maxDesiredBufferSize
    });

    if (!existy(waitTime)) { return undefined; }

    const t = toSegmentTime({ currentRange, segmentDuration, playheadTime });
    const segment = segments[Math.floor(t/segmentDuration)];

    if (!segment) { return undefined; }

    return { waitTime, segment };
};

export { toMediaBufferResult };
export default toMediaBufferResult;