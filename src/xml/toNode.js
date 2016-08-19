'use strict';

const toNode = selector => node => node.querySelector(selector);

export { toNode };
export default toNode;