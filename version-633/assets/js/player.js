(function () {
  function setupPlayer(root) {
    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var button = root.querySelector(".play-button");
    var error = root.querySelector(".player-error");
    var stream = root.getAttribute("data-stream");
    var ready = false;
    var hlsInstance = null;

    if (!video || !stream) {
      return;
    }

    function showError() {
      if (error) {
        error.textContent = "视频暂时无法播放，请稍后再试";
        error.classList.add("show");
      }
    }

    function attachStream() {
      if (ready) {
        return;
      }

      ready = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
        return;
      }

      video.src = stream;
    }

    function play() {
      attachStream();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!ready) {
        play();
      }
    });

    video.addEventListener("error", showError);
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(setupPlayer);
  });
})();
