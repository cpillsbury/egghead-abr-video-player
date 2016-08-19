'use strict';
import video from './player/video';
import ReplaySubject from './frp/ReplaySubject';
import Observable from './frp/Observable';
// support:
// vjs style:
//      ehv('vid-or-container-selector', { config obj });
// bitmovin style:
//      ehv('container-selector').setup({ config obj })

const videoEl = selector => {
    const videoEl = document.createElement('video');
    videoEl.src = 'http://www.html5videoplayer.net/videos/toystory.mp4';
    videoEl.controls = true;
    const containerEl = document.querySelector(selector);
    containerEl.innerHTML = '';
    containerEl.appendChild(videoEl);
    const videoEl$ = new ReplaySubject(1);
    videoEl$.next(videoEl);
    return videoEl$;
};

// const mediaSource = videoEl$ => {
//     return ({ mediaPresentationDuration } = {}) => {
//         const mediaSource$ = videoEl$.switchMap(videoEl => {
//             const mediaSource = new MediaSource();
//             videoEl.src = URL.createObjectURL(mediaSource);
//             return Observable.fromEvent(mediaSource, 'sourceopen')
//                 .do(() => mediaSource.duration = mediaPresentationDuration)
//                 .mapTo(mediaSource)
//                 .take(1);
//         });
//     };
// };

const mediaSource = videoEl$ => {
    return videoEl$.switchMap(videoEl => {
        const mediaSource = new MediaSource();
        videoEl.src = URL.createObjectURL(mediaSource);
        return Observable.fromEvent(mediaSource, 'sourceopen')
            .merge(Observable.of(mediaSource.readyState).filter(rs => rs === 'open'))
            .switchMap(() => {
                const mediaSource$ = new ReplaySubject(1);
                mediaSource$.next(mediaSource);
                return mediaSource$;
            });
    });
};

const toMimeCodec = ({ mimeType, codecs }) => (mimeType + ';codecs="' + codecs.join() + '"');

const sourceBuffer = mediaSource$ => {
    return ({ mimeType, codecs }) => {
        return mediaSource$
            .map(mediaSource => mediaSource.addSourceBuffer(toMimeCodec({ mimeType, codecs })))
            .take(1);
    };
};

const toSourceBufferFactory = videoEl$ => {
    const mediaSourceFactory = mediaSource(videoEl$);
    return ({ mediaPresentationDuration } = {}) => {
        return sourceBuffer(mediaSourceFactory({ mediaPresentationDuration }));
    };
};

const toPlaybackRate$ = vidEl => {
    return Observable.fromEvent(vidEl, 'ratechange')
        .map(() => vidEl.playbackRate)
        .startWith(vidEl.playbackRate);
};

const toPlayheadTime$ = vidEl => {
    const timeupdate$ = Observable.fromEvent(vidEl, 'timeupdate');
    const seeking$ = Observable.fromEvent(vidEl, 'seeking');
    return Observable.merge(timeupdate$, seeking$)
        .map(() => vidEl.currentTime)
        .startWith(vidEl.currentTime);
};

window.ehv = (selector) => {
    const videoEl$ = videoEl(selector);
    const playbackRate$ = videoEl$.switchMap(toPlaybackRate$);
    const playheadTime$ = videoEl$.switchMap(toPlayheadTime$);
    playheadTime$.subscribe(pht => console.log(`pht = ${pht}`));
    playbackRate$.subscribe(pbr => console.log(`pbr = ${pbr}`));
    const setup =  () => Observable.of(20);
    return { setup };
    // const loadVideo = video(videoEl$);
    // const setup = ({ dash } = {}) => {
    //     const mediaSource$ = mediaSource(videoEl$);
    //     mediaSource$.subscribe(ms => console.log(ms.readyState));
    //     //return mediaSource$;
    //     return loadVideo(dash);
    // };
    // return { setup };
};