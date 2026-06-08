function initMoviePlayer(videoId, overlayId, videoUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var attached = false;

    if (!video || !videoUrl) {
        return;
    }

    function attachVideo() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = videoUrl;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function startVideo() {
        attachVideo();
        hideOverlay();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    attachVideo();

    if (overlay) {
        overlay.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startVideo();
        }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('ended', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
