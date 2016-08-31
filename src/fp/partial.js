'use strict';

const partial = (fn, ...args) => (...rest) => fn(...args, ...rest);
// TODO: Put in separate js file? (CJP)
const partialRight = (fn, ...args) => (...rest) => fn(...rest, ...args);

export { partial, partialRight };