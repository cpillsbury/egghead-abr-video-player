'use strict';

// TODO: Use IoC (CJP)
import { Observable } from '../frp/Observable';
import toXML from '../xml/toXML';

const fromUrl = url => {
    return Observable.ajax({ url, responseType: 'text', crossDomain: true }).do(x => console.log(x))
        .map(({ response }) => toXML(response));
};

export { fromUrl };