'use strict';

const assign = (...objs) => Object.assign({}, ...objs);

assign.$$names = { 'assign': true };
assign.$$type = 'instance';

export { assign };