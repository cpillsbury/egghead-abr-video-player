'use strict';

const arr = [];
const distinct = (arrayLike = []) => arr.reduce.call(arrayLike, (arr, x) => !arr.find(y => y === x) ? [...arr, x] : arr, []);

export { distinct };
export default distinct;