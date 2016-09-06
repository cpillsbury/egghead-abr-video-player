'use strict';

const withSwitchMap = c$ => to$ => (...args) => c$.switchMapTo(to$(...args));
export { withSwitchMap };
export default withSwitchMap;