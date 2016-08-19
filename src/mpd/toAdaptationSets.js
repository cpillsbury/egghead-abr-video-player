'use strict';
import { toNodes, attributesToObject } from '../xml/xml';
import { toRepresentations } from './toRepresentations';

const adaptationSetAttrs = [{ name: 'mimeType', type: 'string' }];
const toAdaptationSets = ancestor => {
    return Array.from(toNodes('AdaptationSet')(ancestor), node => {
        const representations = toRepresentations(node);
        return Object.assign({ representations, node }, attributesToObject(...adaptationSetAttrs)(node));
    });
};

export { toAdaptationSets };
export default toAdaptationSets;