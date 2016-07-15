'use strict';

const getRepresentations = ({ descendantsByNameToArray, getSegmentList }) => {
    const toRepresentation = (node) => {
        // TODO: Partial application instead? (CJP)
        const getId = () => node.getAttribute('id');
        const getWidth = () => node.getAttribute('width');
        const getHeight = () => node.getAttribute('height');
        const getFrameRate = () => node.getAttribute('frameRate');
        const getBandwidth = () => node.getAttribute('bandwidth');
        const getCodecs = () => node.getAttribute('codecs');
        const getSegmentListFromRepresentation = () => getSegmentList(node);
        return {
            getId,
            getWidth,
            getHeight,
            getFrameRate,
            getBandwidth,
            getCodecs,
            getSegmentList: getSegmentListFromRepresentation
        };
    };

    const getRepresentations = node => descendantsByNameToArray(node, 'Representation').map(toRepresentation);
    return () => getRepresentations;
};

export { getRepresentations };