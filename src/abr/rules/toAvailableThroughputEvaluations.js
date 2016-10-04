'use strict';

const toAvailableThroughputEvaluations = (ses, { throughput, playbackRate = 1 }) => {
    // NOTE: reduce would probably be more efficient, but this is cleaner/clearer (CJP)
    // NOTE: Current impl won't support multiple matches & fuzzy criteria (e.g. MOE)
    const sebs = [...ses].sort((se1, se2) => se1.stream.bandwidth - se2.stream.bandwidth);
    const ib = sebs.findIndex(({ stream }) => stream.bandwidth * playbackRate < throughput);
    const toEvaluation = ib => i => {
        const e = i - ib;
        if (e < 0) return -0.75;
        if (e > 0) return 0.5;
        return 1;
    };
    return sebs.map(({ stream }, i) => ({ stream, evaluation: toEvaluation(ib)(i) }));
};

// TODO: Figure out details of this impl
toThroughputEvaluations.NAME = 'AVAILABLE_THROUGHPUT';

export { toAvailableThroughputEvaluations };
export default toAvailableThroughputEvaluations;