'use strict';
// TODO: Use IoC (CJP)
import { Observable } from '../frp/Observable';
import { identity } from '../fp/fp';
import { fromUrl } from './manifest';
import { mergedRangesReducer, rangeAlignedTo, toArray, containsPoint } from '../mse/timeRange';
import { toMpd } from '../mpd/mpd';


const mediaSetLoader = mediaSource => mediaSet => {
    // TODO: Cleanup (CJP)
    const playheadTime$ = Observable.fromEvent(theVideo(), 'timeupdate')
        .merge(Observable.fromEvent(theVideo(), 'seeking'))
        .map(() => theVideo().currentTime)
        .startWith(0);
    const mimeType = mediaSet.mimeType;
    const codecs = mediaSet.representations[0].codecs;
    const segmentList = mediaSet.representations[0].segmentList;
    const sourceBuffer = mediaSource.addSourceBuffer(toMimeCodec({ mimeType, codecs }));
    const toNormalizedBuffer = ({ buffered }) => {
        return toArray(buffered)
            .map(rangeAlignedTo(segmentList.segmentDuration))
            .reduce(mergedRangesReducer, []);
    };
    // TODO: figure out how we want to respond to other event states (updateend? error? abort?) (retry? remove?)
    const bufferUpdated = () => {
        return Observable.fromEvent(sourceBuffer, 'updateend')
            .mapTo(sourceBuffer)
            .map(toNormalizedBuffer);
    };
    const loadSegment = ({ url }) => {
        return Observable.ajax({ url, responseType: 'arraybuffer', crossDomain: true })
            .map(({ response }) => response)
            .do(response => sourceBuffer.appendBuffer(response));
    };
    return loadSegment(segmentList.initSegment)
        .switchMapTo(bufferUpdated())
        .switchMap(timeRanges => {
            const toNextSegment = t => {
                // TODO: Visit containsPoint (CJP)
                const containsCurrentTime = (range) => containsPoint(t, ...range);
                const currentRange = timeRanges.find(containsCurrentTime);
                const isBufferFull = currentRange && ((currentRange[1] - t) > 40);
                if (isBufferFull) { return undefined; }
                const nextSegment = currentRange ?
                    segmentList.getByTime(currentRange[1] + segmentList.segmentDuration / 2) :
                    segmentList.getByTime(t);
                return nextSegment;
            };
            return playheadTime$
                .map(toNextSegment)
                .filter(identity)
                .distinctUntilChanged()
                .switchMap(loadSegment);
        });
};

const mediaSetLoaders = theVideo$ => {
    theVideo$.next(document.createElement('video'));
    return mpd => {
        // TODO: Cleanup (CJP)
        const mediaSets = mpd.adaptationSets;
        const sourceOpen$ = Observable.fromEvent(theMediaSource(), 'sourceopen')
            .do(() => theMediaSource().duration = mpd.mediaPresentationDuration)
            .take(1);
        theVideo().src = URL.createObjectURL(theMediaSource());
        return sourceOpen$.switchMap(() => {
            const mediaSetLoaders$ = mediaSets.map(mediaSetLoader(theMediaSource()));
            return Observable.merge(...mediaSetLoaders$);
        });
    };
};

const toDefinite = getEntity => {
    let entity;
    return () => {
        if (!entity) {
            entity = getEntity();
        }
        return entity;
    };
};

const qs = selector => () => document.querySelector(selector);
const theVideo = toDefinite(qs('video'));
const theMediaSource = toDefinite(() => new MediaSource());


const video = theVideo$ => src => {
    // TODO: handle path better (CJP)
    const getMeta$ = fromUrl(src).map(toMpd(src.slice(0, src.lastIndexOf('/') + 1)));
    return getMeta$.switchMap(mediaSetLoaders(theVideo$));
};

export default video;
export { video };