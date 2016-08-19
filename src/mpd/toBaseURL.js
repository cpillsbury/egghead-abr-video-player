'use strict';
import { toAncestorList, findChildByTagName, isValidParentTagName } from '../xml/xml';
import { not } from '../fp/fp';

const getRegExp = () => /^https?:\/\//;

const baseUrlParents = ['MPD', 'Period', 'AdaptationSet', 'Representation'];
const findBaseUrl = findChildByTagName('BaseURL');
const notBaseUrlParent = not(isValidParentTagName(baseUrlParents));
const toBaseUrlNodes = toAncestorList(findBaseUrl)(notBaseUrlParent);

const toBaseURL = hostURL => node => {
    const baseUrls = toBaseUrlNodes(node).map(({ textContent = '' } = {}) => textContent.trim());
    if (!baseUrls.length) { return hostURL; }
    const potentialRootIdx = baseUrls.findIndex(url => url.search(getRegExp()));
    const foundRoot = potentialRootIdx >= 0;
    const sliceEnd = foundRoot ? potentialRootIdx + 1 : baseUrls.length;
    const url = baseUrls.slice(0, sliceEnd).reverse().join('');
    if (foundRoot) { return url; }
    return hostURL + url;
};

export { toBaseURL };
export default toBaseURL;