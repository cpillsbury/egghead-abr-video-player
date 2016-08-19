'use strict';

const isValidParentTagName = validParentNames => parent => !!validParentNames.find(name => parent.tagName === name);

export { isValidParentTagName };
export default isValidParentTagName;