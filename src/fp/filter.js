'use strict';

const arr = [];
const filter = (arrayLike, pred) => arr.filter.call(arrayLike, pred);

export { filter };
export default filter;