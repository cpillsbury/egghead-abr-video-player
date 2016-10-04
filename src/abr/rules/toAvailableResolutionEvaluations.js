const toAvailableResolutionEvaluations = (rs, { width, height }) => {
    const rrs = [...rs].sort((r1, r2) => r2.width - r1.width);
    const ib = rrs.findIndex((r) => r.width < width && r.height < height);
    const toEvaluation = ib => i => {
        const e = i - ib;
        if (e < 0) return -0.75;
        if (e > 0) return 0.5;
        return 1;
    };
    return rrs.map((representation, i, rs) => {
        return { representation, evaluation: toEvaluation(ib)(i) };
    });
    return rrs;
};