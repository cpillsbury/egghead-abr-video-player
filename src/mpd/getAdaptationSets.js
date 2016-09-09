'use strict';

const getAdaptationSets = ({ descendantsByNameToArray, getRepresentations }) => {
    // TODO: Externalize transform? (CJP)
    const toAdaptationSet = (node) => {
        const getMimeType = () => node.getAttribute('mimeType');
        const getRepresentationsForAdaptationSet = () => getRepresentations(node);

        return { getMimeType, getRepresentations: getRepresentationsForAdaptationSet };
    };

    // Pattern for singleton? (CJP)
    // Naming convention (same names confusing)? (CJP)
    const getAdaptationSets = (node) => descendantsByNameToArray(node, 'AdaptationSet').map(toAdaptationSet);
    return () => getAdaptationSets;
};

export { getAdaptationSets };