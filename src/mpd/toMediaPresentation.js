'use strict';

// TODO: IoC (CJP)
import { toDuration } from '../xsd/xsd';
import { identity, toUint, filter, find, asArray } from '../fp/fp';

// TODO: Refactor (DRY) (CJP)

const toCodecs = str => str.split('.').map(str => str.replace(/^0+(?!\.|$)/, '')).join('.');

const isTagName = name => ({ tagName }) => tagName == name;

const toValue = (transform = identity) => attrName => xml => {
    if (!xml.hasAttribute(attrName)) { return undefined; }
    return transform(xml.getAttribute(attrName));
};

const toSegmentTemplate = xml => {
    if (!xml) { return undefined; }
    const timescale = toValue(toUint)('timescale')(xml);
    const duration = toValue(toUint)('duration')(xml);
    const presentationTimeOffset = toValue(toUint)('presentationTimeOffset')(xml);
    const startNumber = toValue(toUint)('startNumber')(xml);
    const initialization = toValue()('initialization')(xml);
    const media = toValue()('media')(xml);
    return { timescale, duration, presentationTimeOffset, startNumber, initialization, media };
};
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

const getRootUrlRegExp = () => /^https?:\/\//;

const toSegments = ({
    baseUrl = '',
    duration = 0,
    totalDuration,
    timescale,
    media,
    startNumber,
    id,
    bandwidth
}) => {
    // TODO: Handle Precision (CJP)
    const segmentDuration = duration / timescale;
    const length = Math.ceil(totalDuration/segmentDuration);
    return Array.from({ length }, (o, i) => {
        // TODO: Handle offsets (CJP)
        const start = segmentDuration * i;
        const end = Math.min(segmentDuration * (i+1), totalDuration);

        const number = startNumber + i;

        return {
            range: [start, end],
            duration: segmentDuration,
            url: baseUrl + formatTemplate(media, { id, bandwidth, number, time: start })
        };
    });
};

const toBaseUrl = (baseUrls = []) => {
    const rootIdx = baseUrls.findIndex(url => url.search(getRootUrlRegExp()));
    return baseUrls.splice(0, rootIdx >= 0 ? rootIdx + 1 : baseUrls.length)
        .reverse()
        .join('');
};

const toInitSegment = ({ baseUrl = '', id, bandwidth, initialization }) => {
    return {
        url: baseUrl + formatTemplate(initialization, { id, bandwidth })
    }
};

const toSegmentInfo  = ({
    baseUrls = [],
    duration = 0,
    range = [0, 0],
    codecs,
    segmentTemplate = {}
}) => xml => {
    const id = toValue()('id')(xml);
    const width = toValue(toUint)('width')(xml);
    const height = toValue(toUint)('height')(xml);
    const frameRate = toValue(toUint)('frameRate')(xml);
    const bandwidth = toValue(toUint)('bandwidth')(xml);
    const baseUrl = toBaseUrl([
        ...asArray(toTextContent(find(xml.children, isTagName('BaseURL')))),
        ...baseUrls
    ]);
    const seed = Object.assign(
        {},
        segmentTemplate,
        toSegmentTemplate(find(xml.children, isTagName('SegmentTemplate'))),
        {
            baseUrl,
            id,
            width,
            height,
            frameRate,
            bandwidth,
            totalDuration: duration
        }
    );

    return {
        id,
        width,
        height,
        frameRate,
        bandwidth,
        duration,
        range,
        codecs: toValue(toCodecs)('codecs')(xml) || codecs,
        initSegment: toInitSegment(seed),
        segments: toSegments(seed)
    };
};

const toMediaSet = ({
    baseUrls = [],
    duration = 0,
    range = [0, 0],
    segmentTemplate = {}
}) => xml => {
    const mimeType = toValue()('mimeType')(xml);
    const seed = {
        baseUrls: [
            ...asArray(toTextContent(find(xml.children, isTagName('BaseURL')))),
            ...baseUrls
        ],
        duration,
        range,
        codecs: toValue(toCodecs)('codecs')(xml),
        mimeType,
        segmentTemplate: Object.assign(
            {},
            segmentTemplate,
            toSegmentTemplate(find(xml.children, isTagName('SegmentTemplate')))
        )
    };
    const children = filter(xml.children, isTagName('Representation')).map(toSegmentInfo(seed));
    return { duration, range, mimeType, children };
};

const toPeriod = ({
    baseUrls = [],
    duration = 0,
    range = [0, 0],
    segmentTemplate = {}
}) => xml => {
    const seed = {
        baseUrls: [
            ...asArray(toTextContent(find(xml.children, isTagName('BaseURL')))),
            ...baseUrls
        ],
        duration,
        range,
        segmentTemplate: Object.assign(
            {},
            segmentTemplate,
            toSegmentTemplate(find(xml.children, isTagName('SegmentTemplate')))
        )
    };
    const children = filter(xml.children, isTagName('AdaptationSet')).map(toMediaSet(seed));
    return { duration, range, children };
};

const toTextContent = xml => {
    if (!xml) { return undefined; }
    return xml.textContent.trim() || undefined;
};

const toMediaPresentation = ({ baseUrls = [] }) => xml => {
    const duration = toValue(toDuration)('mediaPresentationDuration')(xml);
    const type = toValue()('type')(xml);
    const range = [0, duration];
    const seed = {
        baseUrls: [
            ...asArray(toTextContent(find(xml.children, isTagName('BaseURL')))),
            ...baseUrls
        ],
        duration,
        range,
        type,
        segmentTemplate: Object.assign(
            {},
            toSegmentTemplate(find(xml.children, isTagName('SegmentTemplate')))
        )
    };
    const children = filter(xml.children, isTagName('Period')).map(toPeriod(seed));
    return { duration, range, type, children };
};

export { toMediaPresentation };
export default toMediaPresentation;