"use strict";

const K_DELTA = 0.8;

// Algorithm (Recursively defined, where A(i) = throughput of ith fragment):
//
//			Â =	(δ * Â(i-1)) + ((1-δ) * A(i))			i > 1
//				A(1)									i = 1
//
// For more, see: Akhshabi et al. - "An experimental evaluation of rate-adaptive video players over HTTP"
// in "Signal Processing: Image Communication" (2011).
// NOTE: function API implemented to conform to reduce callback.
const calculateThroughput = (avgThroughput, throughput, kD = K_DELTA) => {
    if (typeof avgThroughput !== 'number') { return throughput; }
    return  (kD * avgThroughput) + ((1.0 - kD) * throughput);
};