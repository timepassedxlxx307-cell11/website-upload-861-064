(function () {
  function initPlayer(panel) {
    var video = panel.querySelector('video');
    var cover = panel.querySelector('[data-player-cover]');
    var streamUrl = panel.getAttribute('data-stream-url') || '';
    var hls = null;
    var attached = false;

    if (!video || !cover || !streamUrl) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }
      video.src = streamUrl;
    }

    function startPlayback() {
      cover.classList.add('is-hidden');
      attachSource();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (!attached) {
        startPlayback();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
