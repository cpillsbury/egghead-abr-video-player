'use strict';

const toO = (...ks) => (...vs) => {
    return vs.slice(0, ks.length + 1)
        .reduce((o, v, i) => {
            o[ks[i]] = v;
            return o;
        }, {});
};

export { toO };
export default toO;