'use strict';

const arr = [];
const find = (arrayLike, pred) => arr.find.call(arrayLike, pred);

export { find };
export default find;
