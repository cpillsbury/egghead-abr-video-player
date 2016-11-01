"use strict";

export const streamsToAvailableResolutionEvaluations = (ss, { width, height }) => {
    // NOTE: Sort by width assumes aspect ratio isn't changing between streams (CJP)
    // NOTE: assumes height/width have been
    const rss = [...ss].sort((s1, s2) => s1.width - s2.width);
    const ib = rss.findIndex(r => r.width <= width && r.height <= height);
    const toEvaluation = ib => i => {
        const e = i - ib;
        if (e < 0) return -0.75;
        if (e > 0) return 0.5;
        return 1;
    };
    return rss.map((stream, i) => ({ stream, evaluation: toEvaluation(ib)(i) }));
};

export const toAvailableResolutionEvaluations = (ses, { width, height }) => {
    return streamsToAvailableResolutionEvaluations(ses.map(({ stream }) => stream), { width, height });
};