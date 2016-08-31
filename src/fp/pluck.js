'use strict';

const pluck = (o, head, ...tail) => !tail.length ? (o && o[head]) : (o && o[head] && pluck(o[head], ...tail));

export { pluck };
export default pluck;