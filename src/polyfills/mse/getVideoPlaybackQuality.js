'use strict';

const webkitGetVideoPlaybackQuality = function() {
    return {
        droppedVideoFrames: this.webkitDroppedFrameCount,
        totalVideoFrames: this.webkitDecodedFrameCount,
        // Not provided by this polyfill:
        corruptedVideoFrames: 0,
        creationTime: NaN,
        totalFrameDelay: 0
    };
};

const isWebkitHTMLVideoElement = HTMLVideoElement => 'webkitDroppedFrameCount' in HTMLVideoElement.prototype;

const polyfillImpls = [{ pred: isWebkitHTMLVideoElement, polyfill: webkitGetVideoPlaybackQuality }];

// NOTE: (In the end, necessarily) Mutative (CJP)
const toPolyfill = HTMLVideoElement => {
    const match = polyfillImpls.find(({ pred }) => pred(HTMLVideoElement));
    if (!polyfill) return undefined;
    return match.polyfill;
};

export const polyfillVideoPlaybackQuality = (HTMLVideoElement) => {
    if (!HTMLVideoElement ||                                    // Can't polyfill what doesn't exist
        !HTMLVideoElement.prototype ||
        HTMLVideoElement.prototype.getVideoPlaybackQuality ) {  // No need to polyfill
        return;
    }

    const polyfill = toPolyfill(HTMLVideoElement);
    if (!polyfill) { return; }

    HTMLVideoElement.prototype.getVideoPlaybackQuality = polyfill;
};

export default polyfillVideoPlaybackQuality;