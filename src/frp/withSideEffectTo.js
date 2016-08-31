'use strict';

const withSideEffectTo = f => o$ => o$.do(f);

export { withSideEffectTo };
export default withSideEffectTo;