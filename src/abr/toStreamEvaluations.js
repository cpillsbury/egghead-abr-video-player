'use strict';

// TODO: IoC (CJP)
import toAvailableThroughputEvaluations from './rules/toAvailableThroughputEvaluations';
import toAvailableResolutionEvaluations from './rules/toAvailableResolutionEvaluations';

const comp = (s1, s2) => {
    // Final sort (and tie-breaking) priority:
    // 1. Bandwidth (surrogate for media bitrate)
    // 2. Width (surrogate for resolution)
    // 3. Frame rate
    // 4. id (arbitrary but ensures stable sort)
    return s1.bandwidth - s2.bandwidth ||
        s1.width - s2.width ||
        s1.frameRate - s2.frameRate ||
        s1.id > s2.id ? 1 : -1;
};

// TODO: IoC (CJP)
const wrs = [
    { weight: 1, rule: toAvailableResolutionEvaluations },
    { weight: 1.25, rule: toAvailableThroughputEvaluations }
];

const toStreamEvaluations = ses => {

};