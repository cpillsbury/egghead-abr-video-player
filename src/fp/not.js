'use strict';

const not = fn => {
    return (...args) => !fn(...args);
};

not.$$names = { 'not': true };
not.$$type = 'instance';

export { not };