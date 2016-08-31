'use strict';

import { Observable } from './Observable';

const withConcatTo = c$ => o$ => Observable.concat(c$, o$);

export { withConcatTo };
export default withConcatTo;