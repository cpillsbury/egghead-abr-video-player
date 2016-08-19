'use strict';
const toMediaSource = ({ mediaPresentationDuration } = {}) => {
    const mediaSource = new MediaSource();
    mediaSource.duration = mediaPresentationDuration;
    return mediaSource;
};