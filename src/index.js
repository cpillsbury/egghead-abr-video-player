'use strict';
import { Observable, fromProperty, withDuration, withSideEffect, withConcat, withConcatTo } from './frp/frp';
import toMediaPresentation from './mpd/toMediaPresentation';
import fromUrl from './player/manifest';
import { mergedRangesReducer, rangeAlignedTo, toArray, toCurrentRange, toMimeCodec } from './mse/mse';
import { existy, not, identity, distinct, pluck } from './fp/fp';
import timeToNextSegment from './buffer/timeToNextSegment';

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

        const projection = toMediaPresentation({ baseUrls: [dash.slice(0, dash.lastIndexOf('/') + 1)] });
        return fromUrl(dash)
            .map(xmlDoc => xmlDoc.querySelector('MPD'))
            .map(projection)
            .switchMap(mediaPresentation => {
                return mediaSource$
                    .do(mediaSource => { mediaSource.duration = mediaPresentation.duration; })
                    .switchMap(mediaSource => {
                        const isSupportedMimeType = (...types) => ({ mimeType }) => types.find(type => mimeType && mimeType.indexOf(type) >= 0);
                        const supportedMimeTypes = ['video', 'audio'];
                        const sourceBuffers = pluck(mediaPresentation, 'children', 0, 'children')
                            .filter(isSupportedMimeType(...supportedMimeTypes))
                            .map(mediaSet => {
                                const { mimeType } = mediaSet;
                                const codecs = distinct(pluck(mediaSet, 'children').map(({ codecs }) => codecs));

                                const sb = mediaSource.addSourceBuffer(toMimeCodec({ mimeType, codecs }));
                                const sbIsUpdating$ = fromProperty(
                                    sb,
                                    'updating',
                                    ['abort', 'error', 'update', 'updateend', 'updatestart']
                                ).distinctUntilChanged();

                                const nextSegment$ = sbIsUpdating$
                                    .filter(not(identity))
                                    .mapTo(true);

                                const toSegmentBase$ = ({ url }) => Observable.ajax({url, responseType: 'arraybuffer', crossDomain: true}).map(({ response}) => response)
                                const toSegmentSE$ = withSideEffect(bytes => sb.appendBuffer(bytes))(toSegmentBase$);
                                const toSegmentWithConcat$ = withConcat(nextSegment$.take(1))(toSegmentSE$);
                                const toSegment$ = withDuration(toSegmentWithConcat$);
                                const lastRTT$ = toSegment$.toDuration$();

                                const toNormalizedBuffer = duration => {
                                    const toAligned = rangeAlignedTo(duration);
                                    return buffered => {
                                        return toArray(buffered)
                                            .map(toAligned)
                                            .reduce(mergedRangesReducer, []);
                                    };
                                };

                                const segmentInfo = pluck(mediaSet, 'children', 0);

                                const buffered$ = fromProperty(sb, 'buffered', 'updateend')
                                    .map(toNormalizedBuffer(pluck(segmentInfo, 'segments', 0, 'duration')));

                                const toMediaBuffer$ = segmentInfo => {
                                    const { segments, initSegment } = segmentInfo;
                                    const segmentDuration = pluck(segments, 0, 'duration');
                                    const segmentDuration$ = Observable.of(segmentDuration);

                                    const toSegmentByTime = time => segments[Math.floor(time/segmentDuration)];
                                    const mediaBufferModel$ = Observable.combineLatest(
                                        buffered$,
                                        playheadTime$,
                                        playbackRate$,
                                        lastRTT$,
                                        segmentDuration$,
                                        (buffered, playheadTime, playbackRate, lastRTT, segmentDuration) => {
                                            return {
                                                buffered,
                                                playheadTime,
                                                playbackRate,
                                                lastRTT,
                                                segmentDuration
                                            };
                                        });

                                    const mediaBufferResult$ = mediaBufferModel$
                                        .map(({
                                            buffered,
                                            playheadTime,
                                            playbackRate,
                                            lastRTT,
                                            segmentDuration
                                        }) => {
                                            const currentRange = toCurrentRange(playheadTime)(buffered);
                                            const bufferSize = currentRange ? currentRange[1] - playheadTime : 0;
                                            const waitTime = timeToNextSegment({
                                                lastRTT,
                                                bufferSize,
                                                segmentDuration,
                                                playbackRate
                                            });

                                            if (!existy(waitTime)) { return undefined; }

                                            const toUnitPrecisionFloor = unit => x => Math.floor(x/unit) * unit;
                                            const toSegmentTime = ({ currentRange, segmentDuration, playheadTime }) => {
                                                const baseTime = currentRange ?
                                                    currentRange[1] :
                                                    toUnitPrecisionFloor(segmentDuration)(playheadTime);
                                                return baseTime + (segmentDuration / 2);
                                            };

                                            const t = toSegmentTime({ currentRange, segmentDuration, playheadTime });
                                            const segment = toSegmentByTime(t);

                                            if (!segment) { return undefined; }

                                            return { waitTime, segment };
                                    });

                                    const mediaBuffer$ = mediaBufferResult$
                                        .filter(existy)
                                        .distinctUntilChanged((a, b) => a.segment.url === b.segment.url)
                                        .switchMap(({ segment, waitTime }) => {
                                            return Observable.of(segment)
                                                .delay(waitTime)
                                                .switchMap(toSegment$);
                                        });

                                    return withConcatTo(toSegment$(initSegment))(mediaBuffer$);
                                };
                                return toMediaBuffer$(segmentInfo);
                            });
                        return Observable.merge(...sourceBuffers);
                    })
                    .mapTo(mediaPresentation);
            });
    };
    return { setup };
};

((ehv, global) => window.ehv = ehv)(ehv, window);