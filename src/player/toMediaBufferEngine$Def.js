'use strict';
import { Observable } from '../frp/frp';
import { existy, pluck, toO } from '../fp/fp';
import toMediaBufferResult from '../buffer/toMediaBufferResult';

const toMediaBufferEngine$Def = ({ buffered$, playheadTime$, playbackRate$, lastRTT$, toSegment$ }) => {
    const mediaBufferModelProps = [
        'buffered',
        'playheadTime',
        'playbackRate',
        'lastRTT',
        'segmentDuration',
        'segments',
        'minDesiredBufferSize',
        'maxDesiredBufferSize'
    ];

    const toMediaBufferModel$ = segmentInfo => {
        return Observable.combineLatest(
            buffered$,
            playheadTime$,
            playbackRate$,
            lastRTT$,
            Observable.of(pluck(segmentInfo, 'segments', 0, 'duration')),
            Observable.of(segmentInfo.segments),
            toO(...mediaBufferModelProps));
    };

    const toMediaBuffer$ = mediaBufferModel$ => {
        return mediaBufferModel$
            .map(toMediaBufferResult)
            .filter(existy)
            .distinctUntilChanged((a, b) => a.segment.url === b.segment.url)
            .switchMap(({ segment, waitTime }) => {
                return Observable.of(segment)
                    .delay(waitTime)
                    .switchMap(toSegment$);
            });
    };

    return segmentInfo => {
        return toSegment$(segmentInfo.initSegment)
            .switchMapTo(toMediaBuffer$(toMediaBufferModel$(segmentInfo)));
    };
};

export { toMediaBufferEngine$Def };
export default toMediaBufferEngine$Def;