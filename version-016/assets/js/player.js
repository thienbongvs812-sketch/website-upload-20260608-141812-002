(function () {
  const players = document.querySelectorAll('[data-player]');

  players.forEach(function (box) {
    const video = box.querySelector('video');
    const button = box.querySelector('[data-player-button]');
    const stream = box.getAttribute('data-stream');
    let ready = false;
    let hls = null;

    const attach = function () {
      if (ready || !video || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
    };

    const play = function () {
      attach();
      box.classList.add('is-playing');
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove('is-playing');
        }
      });
      video.addEventListener('click', function () {
        if (!ready) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  });
})();
