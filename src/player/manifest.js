'use strict';

// TODO: Use IoC (CJP)
import { Observable } from '../frp/Observable';
import toXML from '../xml/toXML';

const fromUrl = url => {
    return Observable.ajax({ url, responseType: 'text', crossDomain: true })
        .map(({ response }) => toXML(response));
};

export { fromUrl };
export default fromUrl;