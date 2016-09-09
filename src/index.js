'use strict';
import {
    Observable,
    ReplaySubject,
    fromProperty,
    withSideEffect,
    withSideEffectTo,
    withSwitchMap,
    provideDuration
} from './frp/frp';

import toMediaPresentation from './mpd/toMediaPresentation';
import mediaSetToMimeCodec from './mpd/mediaSetToMimeCodec';
import toSupportedMediaSets from './mpd/toSupportedMediaSets';
import fromUrl from './player/manifest';
import toMediaBufferEngine$Def from './player/toMediaBufferEngine$Def';
import toSwitchingEngine$Def from './player/toSwitchingEngine$Def';
import toABREngine$Def from './player/toABREngine$Def';
import { not, identity, chain } from './fp/fp';

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
                return withSideEffectTo(mediaSource => { mediaSource.duration = mediaPresentation.duration; })(mediaSource$)
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

((ehv, global) => global.ehv = ehv)(ehv, window);