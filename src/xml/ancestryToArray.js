const ancestryToArray = ({ identity }) => {

    const isParentless = node => !node.parentNode;

    // TODO: Make generic for any obj with a "parent-like" prop (or non-circular ref chain)? (abstract away parentNode prop name?) (CJP)
    // Pattern for singleton? (CJP)
    // Naming convention (same names confusing)? (CJP)
    const ancestryToArray = (node, mapFn = identity, isLastAncestorPredFn = isParentless, index = 0) => {
        if (!node) { return []; }
        if (isLastAncestorPredFn(node)) { return [mapFn(node, index)]; }
        return [...ancestryToArray(node.parentNode, mapFn, isLastAncestorPredFn, index + 1), mapFn(node, index)];
    };

    return () => ancestryToArray;
};

ancestryToArray.$$dependencies = {
    'identity': 'instance'
};

ancestryToArray.$$names = {
    'ancestryToArray': true
};

ancestryToArray.$$type = 'definition';

export { ancestryToArray };