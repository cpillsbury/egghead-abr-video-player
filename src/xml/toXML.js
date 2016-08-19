'use strict';

const toXML = (str) => {
    return (new DOMParser()).parseFromString(str, 'text/xml');
};
export default toXML;
export { toXML };