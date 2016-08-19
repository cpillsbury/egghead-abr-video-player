'use strict';

const findChildByTagName = name => parent => [].find.call(parent.children, ({ tagName }) => tagName === name);

export { findChildByTagName };
export default findChildByTagName;