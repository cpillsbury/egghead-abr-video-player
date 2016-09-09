'use strict';

const toABREngine$Def = ({ toMediaBufferEngine$, toSwitchingEngine$ }) => {
    return (mediaSet) => {
        return toSwitchingEngine$(mediaSet)
            .switchMap(toMediaBufferEngine$);
    };
};

export { toABREngine$Def };
export default toABREngine$Def;