'use strict';

const toMimeCodec = ({ mimeType, codecs }) => (mimeType + ';codecs="' + codecs.join() + '"');

export { toMimeCodec };
export default toMimeCodec;