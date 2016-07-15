'use strict';

const findAncestor = ({ identity }) => {
    // TODO: Make generic for any obj with a "parent-like" prop (or non-circular ref chain)? (abstract away parentNode prop name?) (CJP)
    const findAncestor = (node, predicateFn = identity) => {
        if (!node)  { return undefined; }
        if (predicateFn(node)) { return node; }
        return findAncestor(node.parentNode, predicateFn);
    };

    return () => findAncestor;
};

export { findAncestor };