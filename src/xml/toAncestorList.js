'use strict';

const toAncestorList = toEntity => shouldStop => ancestor => {
    if (!ancestor || shouldStop(ancestor)) return [];
    const recurse = toAncestorList(toEntity)(shouldStop);
    const entity = toEntity(ancestor);
    if (!entity) return [...recurse(ancestor.parentElement)];
    return [entity, ...recurse(ancestor.parentElement)];
};

export { toAncestorList };
export default toAncestorList;