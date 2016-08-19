'use strict';

const toNodes = selector => node => node.querySelectorAll(selector);

export { toNodes };
export default toNodes;