'use strict';

import polyfillVideoPlaybackQuality from './mse/getVideoPlaybackQuality';

// TODO: Determine where polyfill application should occur (CJP)
// TODO: IoC for globals? (CJP)
export const apply = () => {
    polyfillVideoPlaybackQuality(HTMLVideoElement);
};