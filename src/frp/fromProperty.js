'use strict';

import Observable from './Observable';
import { existy } from '../fp/fp';

const fromProperty = (o, props, eventNames = []) => {
    if (!existy(props)) { throw new Error(`Invalid props argument of ${props}`); }
    props = Array.isArray(props) ? props : [props];
    if (!existy(eventNames)) { eventNames = []; }
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    const events$ = eventNames.map(name => Observable.fromEvent(o, name).pluck('target'));
    const o$ = Observable.of(o);
    const all$ = [o$, ...events$];
    return Observable.merge(...all$)
        .pluck(...props)
        .distinctUntilChanged();
};

export { fromProperty };
export default fromProperty;