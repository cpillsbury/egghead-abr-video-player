'use strict';

// NOTE: Export for testing purposes (CJP)
export const streamsToAvailableThroughputEvaluations = (ss, { throughput, playbackRate = 1 }) => {
    // NOTE: reduce would probably be more efficient, but this is cleaner/clearer (CJP)
    // NOTE: Current impl won't support multiple matches & fuzzy criteria (e.g. MOE)
    const bss = [...ss].sort((s1, s2) => s1.bandwidth - s2.bandwidth);
    const ib = bss.findIndex(({ bandwidth }) => bandwidth * playbackRate < throughput);
    const toEvaluation = ib => i => {
        const e = i - ib;
        if (e < 0) return -0.75;
        if (e > 0) return 0.5;
        return 1;
    };
    return bss.map((stream, i) => ({ stream, evaluation: toEvaluation(ib)(i) }));
};

const toAvailableThroughputEvaluations = (ses, { throughput, playbackRate = 1 }) => {
    return streamsToAvailableThroughputEvaluations(ses.map(({ stream }) => stream), { throughput, playbackRate });
};

// TODO: Figure out details of this impl
toAvailableThroughputEvaluations.NAME = 'AVAILABLE_THROUGHPUT';

export { toAvailableThroughputEvaluations };
export default toAvailableThroughputEvaluations;