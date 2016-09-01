'use strict';
import { Observable, ReplaySubject, fromProperty, withSideEffect } from './frp/frp';
import toMediaPresentation from './mpd/toMediaPresentation';
import fromUrl from './player/manifest';
import { mergedRangesReducer, rangeAlignedTo, toArray, toCurrentRange, toMimeCodec } from './mse/mse';
import { existy, not, identity, pluck, chain } from './fp/fp';
import timeToNextSegment from './buffer/timeToNextSegment';

const supportedMimeTypes = ['video/mp4', 'audio/mp4'];
const isSupportedMimeType = (...types) => ({ mimeType }) => types.find(type => mimeType && mimeType.indexOf(type) >= 0);
const toSupportedMediaSets = mediaPresentation => {
    return pluck(mediaPresentation, 'children', 0, 'children')
        .filter(isSupportedMimeType(...supportedMimeTypes));
};

const mediaSetToMimeCodec = ({ mimeType, children }) => {
    return toMimeCodec({ mimeType, codecs: children.map(({ codecs }) => codecs) });
};

const toNormalizedBuffer = duration => {
    const toAligned = rangeAlignedTo(duration);
    return buffered => {
        return toArray(buffered)
            .map(toAligned)
            .reduce(mergedRangesReducer, []);
    };
};

const toUnitPrecisionFloor = unit => x => Math.floor(x/unit) * unit;
const toSegmentTime = ({ currentRange, segmentDuration, playheadTime }) => {
    const baseTime = currentRange ?
        currentRange[1] :
        toUnitPrecisionFloor(segmentDuration)(playheadTime);
    return baseTime + (segmentDuration / 2);
};

const toO = (...ks) => (...vs) => {
    return vs.slice(0, ks.length + 1)
        .reduce((o, v, i) => {
            o[ks[i]] = v;
            return o;
        }, {});
};

const toMerged = (...os) => Object.assign({}, ...os);

const toMediaBufferResult = ({
    buffered,
    playheadTime,
    playbackRate,
    lastRTT,
    segmentDuration,
    segments,
    minDesiredBufferSize,
    maxDesiredBufferSize
}) => {
    const currentRange = toCurrentRange(playheadTime)(buffered);
    const bufferSize = currentRange ? currentRange[1] - playheadTime : 0;
    const waitTime = timeToNextSegment({
        lastRTT,
        bufferSize,
        segmentDuration,
        playbackRate,
        minDesiredBufferSize,
        maxDesiredBufferSize
    });

    if (!existy(waitTime)) { return undefined; }

    const t = toSegmentTime({ currentRange, segmentDuration, playheadTime });
    const segment = segments[Math.floor(t/segmentDuration)];

    if (!segment) { return undefined; }

    return { waitTime, segment };
};

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
            buffered$.map(toNormalizedBuffer(pluck(segmentInfo, 'segments', 0, 'duration'))),
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

// TODO: Implement me (CJP)
const toSwitchingEngine$Def = () => {
    return (mediaSet) => {
        return Observable.of(pluck(mediaSet, 'children', 0));
    };
};

const toABREngine$Def = ({ toMediaBufferEngine$, toSwitchingEngine$ }) => {
    return (mediaSet) => {
        return toSwitchingEngine$(mediaSet)
            .switchMap(toMediaBufferEngine$);
    };
};

const provideDuration = s$ => to$ => {
    return (...args) => {
        return Observable.create(sub => {
            const start = Date.now();
            to$(...args).subscribe(x => {
                s$.next(Date.now() - start);
                sub.next(x);
            });
        });
    };
};

const ehv = (selector) => {

    const videoEl = document.createElement('video');
    videoEl.controls = true;
    const containerEl = document.querySelector(selector);
    containerEl.innerHTML = '';
    containerEl.appendChild(videoEl);

    const playbackRate$ = fromProperty(videoEl, 'playbackRate', 'ratechange');
    const playheadTime$ = fromProperty(videoEl, 'currentTime', ['timeupdate', 'seeking']);

    const setup = ({ dash } = {}) => {

        const mediaSource = new MediaSource();
        videoEl.src = URL.createObjectURL(mediaSource);

        const mediaSourceReadyState$ = fromProperty(
            mediaSource,
            'readyState',
            ['sourceopen', 'sourceclose', 'sourceended']
        );

        const mediaSource$ = mediaSourceReadyState$
            .filter(rs => rs === 'open')
            .mapTo(mediaSource);

        const withMediaSourceUpdate = mediaSource$ => mediaPresentation$ => {
            return mediaPresentation$.switchMap(mediaPresentation => {
                return mediaSource$
                    .do(mediaSource => { mediaSource.duration = mediaPresentation.duration; })
                    .mapTo(mediaPresentation);
            });
        };

        const toMediaPresentation$ = withMediaSourceUpdate(mediaSource$);

        const projection = toMediaPresentation({ baseUrls: [dash.slice(0, dash.lastIndexOf('/') + 1)] });
        const mediaPresentation$ = toMediaPresentation$(
            fromUrl(dash)
            .map(xmlDoc => xmlDoc.querySelector('MPD'))
            .map(projection)
        );

        return mediaPresentation$
            .switchMap(mediaPresentation => {
                return mediaSource$
                    .do(mediaSource => { mediaSource.duration = mediaPresentation.duration; })
                    .switchMap(mediaSource => {
                        const mediaBuffers = toSupportedMediaSets(mediaPresentation)
                            .map(mediaSet => {
                                const sb = mediaSource.addSourceBuffer(mediaSetToMimeCodec(mediaSet));
                                const buffered$ = fromProperty(sb, 'buffered', 'updateend');
                                const sbIsUpdating$ = fromProperty(
                                    sb,
                                    'updating',
                                    ['abort', 'error', 'update', 'updateend', 'updatestart']
                                );

                                const nextSegment$ = sbIsUpdating$
                                    .filter(not(identity))
                                    .mapTo(true);

                                const lastRTT$ = new ReplaySubject(1);
                                const withSwitchMap = c$ => to$ => (...args) => c$.switchMapTo(to$(...args));

                                const toSegment$ = chain(
                                    provideDuration(lastRTT$),
                                    withSideEffect(bytes => sb.appendBuffer(bytes)),
                                    withSwitchMap(nextSegment$.take(1))
                                )(({ url }) => Observable.ajax({url, responseType: 'arraybuffer', crossDomain: true}).map(({ response}) => response));

                                const deps = {
                                    buffered$,
                                    playheadTime$,
                                    playbackRate$,
                                    lastRTT$,
                                    toSegment$
                                };

                                const toMediaBufferEngine$ = toMediaBufferEngine$Def(deps);
                                const toSwitchingEngine$ = toSwitchingEngine$Def();
                                const toABREngine$ = toABREngine$Def({ toMediaBufferEngine$, toSwitchingEngine$ });

                                return toABREngine$(mediaSet);
                            });
                        return Observable.merge(...mediaBuffers);
                    });
            });
    };
    return { setup };
};

((ehv, global) => window.ehv = ehv)(ehv, window);