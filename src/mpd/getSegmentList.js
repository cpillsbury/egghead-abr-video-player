'use strict';
// Period.start


// TODO: MOVE ME!!!! (CJP)
// Use getter since JS RegExp is stateful. (CJP)
const getRegExp = () => /\$(RepresentationID|Number|Bandwidth|Time)?(?:%0([0-9]+)d)?\$/g;

const padTo = (str, length = 0) => {
    if (!length) { return str; }
    if (str.length >= length) { return str; }
    return padTo('0' + str, length - 1);
};

const formatTemplate = (templateStr = '', { representationID, number, bandwidth, time }) => {
    const valueTable = {
        RepresentationID: representationID,
        Number: number,
        Bandwidth: bandwidth,
        Time: time
    };

    return templateStr.replace(getRegExp(), (match, name, widthStr) => {
        if (match === '$$') { return '$'; }
        // TODO: Handle missing arg cases (CJP)
        // TODO: Handle invalid padding case (CJP)
        const valueStr = valueTable[name].toString();
        return padTo(valueStr, +widthStr);
    });
};
// END OF MOVE ME (CJP)

const getSegmentList = ({ findAncestor }) => {
    const getSegmentList = (node) => {
        const segmentTemplateParent = findAncestor(node, ({ children }) => {
            return Array.from(children).find(({ tagName }) => (tagName === 'SegmentTemplate'));
        });
        const segmentTemplate = segmentTemplateParent && Array.from(segmentTemplateParent.children)
                .find(({ tagName }) => (tagName === 'SegmentTemplate'));
        return segmentTemplate;
    };

    return () => getSegmentList;
};

export { getSegmentList };