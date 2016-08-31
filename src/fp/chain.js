'use strict';

const chain = (...fs) => x => fs.reduce((y, f) => f(y), x);

export { chain };
export default chain;