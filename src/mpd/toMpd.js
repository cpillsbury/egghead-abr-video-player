'use strict';
import { identity, not, toUint } from '../fp/fp';
import { attributesToObject, findChildByTagName, isValidParentTagName, toAncestorList, toNode } from '../xml/xml';
import { toBaseURL } from './toBaseURL';
import { toAdaptationSets } from './toAdaptationSets';
// TODO: REMOVE ME DUPLICATE (CJP)
const Projections = {
    uint: toUint
};
// TODO: MOVE ME (CJP)
const segmentTemplateAttrs = [
    { name: 'timescale', type: 'uint' },
    { name: 'duration', type: 'uint' },
    { name: 'startNumber', type: 'uint' },
    { name: 'presentationTimeOffset', type: 'uint' },
    { name: 'initialization', type: 'string' },
    { name: 'media', type: 'string' }
];
const withSegmentLists = (mpd, hostURL) => {
    const adaptationSets = mpd.adaptationSets.map(adaptationSet => {
        const representations = adaptationSet.representations.map(
            representation => {
                const baseURL = toBaseURL(hostURL)(representation.node);
                const segmentTemplates = getSegmentTemplates(representation.node);
                const segmentTemplateObj = segmentTemplateAttrs.reduce((obj, {name, type }) => {
                    const nodeWithAttr = segmentTemplates.find(node => node.hasAttribute(name));
                    if (nodeWithAttr) {
                        const toValue = Projections[type] || identity;
                        obj[name] = toValue(nodeWithAttr.getAttribute(name));
                    }
                    return obj;
                }, {});

                const toSegmentList = ({
                    duration,
                    timescale,
                    media,
                    initialization,
                    startNumber,
                    presentationTimeOffset
                }) => {
                    // TODO: Handle Precision (CJP)
                    const segmentDuration = duration / timescale;
                    // TODO: Externalize and pass in somehow (CJP)
                    const totalDuration = mpd.mediaPresentationDuration;
                    const { id, bandwidth } = representation;
                    const initSegment = { url: baseURL + formatTemplate(initialization, { bandwidth, id }) };

                    const length = Math.ceil(totalDuration/segmentDuration);
                    const array = Array.from({ length }, (o, i) => {
                        // TODO: Handle offsets (CJP)
                        const start = segmentDuration * i;
                        const end = Math.min(segmentDuration * (i+1), totalDuration);

                        const number = startNumber + i;
                        const time = start;

                        return {
                            range: [start, end],
                            duration: segmentDuration,
                            url: baseURL + formatTemplate(media, { id, bandwidth, number, time })
                        };
                    });
                    const getByTime = time => array[Math.floor(time/segmentDuration)];
                    return Object.assign({ segmentDuration, totalDuration, initSegment, getByTime, length }, array);
                };
                const segmentList = toSegmentList(segmentTemplateObj);
                return Object.assign(representation, { segmentList });
            }
        );
        return Object.assign(adaptationSet, { representations });
    });
    return Object.assign(mpd, { adaptationSets });
} ;

const SegmentTemplateParents = ['Period', 'AdaptationSet', 'Representation'];
const findSegmentTemplate = findChildByTagName('SegmentTemplate');
const notSegmentTemplateParent = not(isValidParentTagName(SegmentTemplateParents));
const getSegmentTemplates = toAncestorList(findSegmentTemplate)(notSegmentTemplateParent);

const getRegExp = () => /\$(RepresentationID|Number|Bandwidth|Time)?(?:%0([0-9]+)d)?\$/g;

const padTo = (str, length = 0) => {
    if (!length) { return str; }
    if (str.length >= length) { return str; }
    return padTo('0' + str, length - 1);
};

const formatTemplate = (templateStr = '', { id, number, bandwidth, time }) => {
    const valueTable = {
        RepresentationID: id,
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

const mpdAttrs = [
    { name: 'mediaPresentationDuration', type: 'duration' },
    { name: 'type', type: 'string' },
    { name: 'minimumUpdatePeriod', type: 'duration' },
    { name: 'availabilityStartTime', type: 'dateTime' },
    { name: 'suggestedPresentationDelay', type: 'duration' },
    { name: 'timeShiftBufferDepth', type: 'duration' }
];
const toMpd = baseURL => ancestor => {
    const node = toNode('MPD')(ancestor);
    const adaptationSets = toAdaptationSets(node);
    const mpd = Object.assign({ adaptationSets, node }, attributesToObject(...mpdAttrs)(node));
    return withSegmentLists(mpd, baseURL);
};

export { toMpd };
export default toMpd;