'use strict';

import { Observable } from './Observable';

const withConcat = c$ => to$ => (...args) => Observable.concat(c$, to$(...args));

export { withConcat };
export default withConcat;