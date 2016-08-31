'use strict';

const withSideEffect = f => to$ => (...args) => to$(...args).do(f);

export { withSideEffect };
export default withSideEffect;