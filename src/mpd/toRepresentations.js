'use strict';
import { toNodes, attributesToObject } from '../xml/xml';

// TODO: DUPLICATE REMOVE ME!!! (CJP)
const toCodecs = str => str.split('.').map(str => str.replace(/^0+(?!\.|$)/, '')).join('.');

const representationAttrs = [
    { name: 'id', type: 'string' },
    { name: 'width', type: 'uint' },
    { name: 'height', type: 'uint' },
    { name: 'frameRate', type: 'uint' }, // TODO: Verify FrameRateType from ISO IEC 23009-1 (CJP)
    { name: 'bandwidth', type: 'uint' },
    { name: 'codecs', type: 'codecs' }
];
const toRepresentations = ancestor => {
    return Array.from(toNodes('Representation')(ancestor), node => {
        // TODO: Cleanup
        const representation = attributesToObject(...representationAttrs)(node);
        if (!representation.codecs) {
            representation.codecs = toCodecs(ancestor.getAttribute('codecs'));
        }
        return Object.assign({ node }, representation);
    });
};

export { toRepresentations};
export default toRepresentations;