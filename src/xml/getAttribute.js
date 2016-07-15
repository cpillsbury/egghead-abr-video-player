'use strict';

const getAttribute = (node, attrName) => node.getAttribute(attrName);
// TODO: Use curried version? (CJP)
// const getAttribute = node => attrName => node.getAttribute(attrName);

export { getAttribute };