'use strict';

const descendantsByNameToArray = (node, name, mapFn) => {
    if (!(node && node.getElementsByTagName)) { return undefined; }
    return Array.from(node.getElementsByTagName(name), mapFn);
};

export { descendantsByNameToArray };