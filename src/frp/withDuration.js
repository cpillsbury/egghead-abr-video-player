'use strict';

import ReplaySubject from './ReplaySubject';

// const withDuration = projection => {
//     return (...args) => {
//         const start = Date.now();
//         return projection(...args)
//             .map(value => ({ value, duration: (Date.now() - start) }));
//     };
// };

const withDuration = selector => {
    const duration$ = new ReplaySubject(1);
    const newSelector = (...args) => {
        const start = Date.now();
        return selector(...args)
            .do(() => duration$.next(Date.now() - start));
    };
    newSelector.duration = () => duration$;
    return newSelector;
};

export { withDuration };
export default withDuration;