'use strict';
const MIN_DESIRED_BUFFER_SIZE = 40;
const MAX_DESIRED_BUFFER_SIZE = 80;

const timeToNextSegment = ({
    lastRTT = 0,
    bufferSize = 0,
    segmentDuration = 2,
    playbackRate = 1,
    minDesiredBufferSize = MIN_DESIRED_BUFFER_SIZE,
    maxDesiredBufferSize = MAX_DESIRED_BUFFER_SIZE
}) => {
    // If we have more than the target maximum buffer size in the buffer, we
    // don't need to buffer at all.
    if (bufferSize >= maxDesiredBufferSize) { return undefined; }
    // If we have less than the target minimum buffer size in the buffer, we
    // should get the next segment immediately.
    if (bufferSize < minDesiredBufferSize) { return 0; }
    // Otherwise, we're between the target minimum and target maximum buffer
    // size. In this case, try to get segments at the rate of playback.
    // Ex: If a segment is 4 seconds long, and we're playing at a standard
    // playback rate (1), and it took 2 seconds, roundtrip, to get the last
    // segment, we should get our next segment in 2 seconds.
    // If our roundtrip took 6 seconds, however, we'd still want to download
    // immediately, since our download rate is slower than the rate of playback.
    return Math.max(Math.floor(((segmentDuration * 1000)/playbackRate) - lastRTT), 0);
};

export default timeToNextSegment;
export { timeToNextSegment };