'use strict';

// TODO: Implement me (CJP)
// NOTES:
// 1. getVideoPlaybackQuality() will provide total dropped frames and total played frames when invoked;
// need to poll to get info over time
// 2. Doesn't provide playheadTime info of frames; need to match time frames of playback to time frames wherein
// dropped frames count changes
// 3. MSE/getVideoPlaybackQuality() doesn't store/expose which media content is stored @ time ranges tm -> tn; need to
// keep track of/model which media segment was added to sourceBuffer for a given time range
// 4. evaluations should be based on ratio of dropped frames ratio (dropped frames/sec) & frames ratio (frames/sec)
// 5. root cause of dropped frames is inherently underdetermined wrt playback environment. 2 most relevant scenarios:
//      a) processor is *contingently* unable to keep up with frame decoding (bc other processes are consuming resources)
//      b) processor is *inherently* unable to keep up with frame decoding (bc processor isn't powerful enough)
// although the rule will in the end have to favor one scenario over the other, to account for both possibilities,
// rule should model a time window (that could hypothetically be Number.POSITIVE_INFINITY to assume scenario b (cannot
// simply use media source's duration, since time window is based on decoding and playback, which could be larger
// than duration due to e.g. seeking and replaying media portions))
// 6. Because of the way MSE implements sourceBuffer, if we have already loaded media content into the buffer that
// results in condition 5.b, above, there is no clean way to "purge" and reload that media content (without dumping the
// entire buffer). This means that seeking back to a time within ranges tm -> tn will still drop frames. This is an
// inherent shortcoming of the MSE specification.
export const toExcessiveDroppedFramesEvaluations = (ses, m) => ses;
