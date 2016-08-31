'use strict';

import ReplaySubject from './ReplaySubject';

const withDuration = selector => {
    const duration$ = new ReplaySubject(1);
    const newSelector = (...args) => {
        const start = Date.now();
        return selector(...args)
            .do(() => duration$.next(Date.now() - start));
    };
    newSelector.toDuration$ = () => duration$;
    return newSelector;
};

export { withDuration };
export default withDuration;