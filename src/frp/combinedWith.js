'use strict';

import { Observable } from './Observable';

const combinedWith = (...o$AndMaybeT) => o$ => Observable.combineLatest(o$, ...o$AndMaybeT);