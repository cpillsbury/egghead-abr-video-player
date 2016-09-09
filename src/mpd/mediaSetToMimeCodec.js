'use strict';
import { toMimeCodec } from '../mse/mse';

const mediaSetToMimeCodec = ({ mimeType, children }) => {
    return toMimeCodec({ mimeType, codecs: children.map(({ codecs }) => codecs) });
};

export { mediaSetToMimeCodec };
export default mediaSetToMimeCodec;