'use strict';
import { identity, isString, toUint } from '../fp/fp';
import { toDateTime, toDuration } from '../xsd/xsd';

// TODO: Move projection fns (CJP)
// NOTE: LEADING ZEROS IN CODEC TYPE/SUBTYPE ARE TECHNICALLY NOT SPEC COMPLIANT, BUT GPAC & OTHER
// DASH MPD GENERATORS PRODUCE THESE NON-COMPLIANT VALUES. HANDLING HERE FOR NOW.
// See: RFC 6381 Sec. 3.4 (https://tools.ietf.org/html/rfc6381#section-3.4)
const toCodecs = str => str.split('.').map(str => str.replace(/^0+(?!\.|$)/, '')).join('.');

const Projections = {
    duration: toDuration,
    dateTime: toDateTime,
    uint: toUint,
    codecs: toCodecs
};

const attributesToObject = (...attrs) => {
    const aos = attrs.map(name => {
        if (!isString(name)) { return name; }
        return { name };
    });
    return node => {
        return aos.reduce((obj, { name, type }) => {
            const toValue = Projections[type] || identity;
            if (node.hasAttribute(name)) {
                obj[name] = toValue(node.getAttribute(name));
            }
            return obj;
        }, {});
    };
};

export { attributesToObject };
export default attributesToObject;