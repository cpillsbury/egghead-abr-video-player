'use strict';
import { Observable } from '../frp/frp';
import { pluck } from '../fp/fp';

// TODO: Implement me (CJP)
const toSwitchingEngine$Def = () => {
    return (mediaSet) => {
        return Observable.of(pluck(mediaSet, 'children', 0));
    };
};

export { toSwitchingEngine$Def };
export default toSwitchingEngine$Def;