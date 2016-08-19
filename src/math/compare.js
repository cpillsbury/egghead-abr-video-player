'use strict';

const lt = (x, y, tol = 0) => ((x - tol) < (y + tol));
const gt = (x, y, tol = 0) => lt(y, x, tol);
const eq = (x, y, tol = 0) => Math.abs(x - y) <= tol;
const lte = (x, y, tol = 0) => lt(x, y, tol) || eq(x, y, tol);
const gte = (x, y, tol = 0) => gt(x, y, tol) || eq(x, y, tol);

export { lt };
export { gt };
export { eq };
export { lte };
export { gte };
export default { lt, gt, eq, lte, gte };