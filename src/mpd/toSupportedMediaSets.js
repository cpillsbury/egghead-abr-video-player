'use strict';
import { pluck } from '../fp/fp';

// TODO: Use IOC to provide supportedMediaTypes (CJP)
const supportedMimeTypes = ['video/mp4', 'audio/mp4'];
const isSupportedMimeType = (...types) => ({ mimeType }) => types.find(type => mimeType && mimeType.indexOf(type) >= 0);
const toSupportedMediaSets = mediaPresentation => {
    return pluck(mediaPresentation, 'children', 0, 'children')
        .filter(isSupportedMimeType(...supportedMimeTypes));
};

export { toSupportedMediaSets };
export default toSupportedMediaSets;