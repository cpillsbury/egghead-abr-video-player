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

// Core functionality of buffering logic. Takes a bunch of model data as
// input and provides 2 things as output:
// 1. When to make a request for the next segment (relative to now)
// 2. Which segment to request
// If the buffer projection determines that no segment should be downloaded, given the model data, should return undefined.
// TODO: May want to provide a Media-timeline relative time instead of a specific segment to better handle future cases
// wherein Segments across representations don't align (but even to better handle switching between media stream representations) (CJP)
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
    // Since the buffer information may not perfectly align to known segment duration, normalize the ranges within the
    // buffer (align them to segment duration and merge "touching" buffered ranges)
    const normalizedBuffer = toNormalizedRanges(segmentDuration)(buffered);
    // Identify the buffered range that the playheadTime falls within (undefined if playheadTime is at a point that is
    // not yet buffered, either because we haven't loaded any segments into the buffer or we've seeked to a point in
    // time not yet buffered)
    // TODO: Short circuit if currentRange[1] === end of media timeline to avoid unnecessary computation (CJP)
    const currentRange = toCurrentRange(playheadTime)(normalizedBuffer);
    // Determine the amount of buffered media available for continuous playback, relative to the current playheadTime
    const bufferSize = currentRange ? currentRange[1] - playheadTime : 0;
    // Determine how long to wait to request the next segment needed for continuous playback (See: timeToNextSegment()
    // for details)
    const waitTime = timeToNextSegment({
        lastRTT,
        bufferSize,
        segmentDuration,
        playbackRate,
        minDesiredBufferSize,
        maxDesiredBufferSize
    });

    // If waitTime reports undefined, this means we have a sufficient amount of media in the buffer for playback.
    // In this case, return undefined to indicate we don't currently need another segment.
    if (!existy(waitTime)) { return undefined; }

    // Otherwise, determine what segment we need to request to extend buffer for continuous playback
    // based on the current buffered range the playheadTime falls within.
    const t = toSegmentTime({ currentRange, segmentDuration, playheadTime });
    const segment = segments[Math.floor(t/segmentDuration)];

    // If no segment is found (e.g. because the end of currentRange is the end of the media timeline), no segment to
    // download. In this case, return undefined to indicate we don't currently need another segment.
    if (!segment) { return undefined; }

    return { waitTime, segment };
};

export { toMediaBufferResult };
export default toMediaBufferResult;