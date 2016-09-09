'use strict';
import Observable from './Observable';

const provideDuration = s$ => to$ => {
    return (...args) => {
        return Observable.create(sub => {
            const start = Date.now();
            to$(...args).subscribe(x => {
                s$.next(Date.now() - start);
                sub.next(x);
            });
        });
    };
};

export { provideDuration };
export default provideDuration;