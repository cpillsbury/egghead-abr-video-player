'use strict';

const identity = o => o;

identity.$$names = { 'identity': true };
identity.$$type = 'instance';

export { identity };