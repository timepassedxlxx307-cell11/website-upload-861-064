(function () {
  var video = document.querySelector("[data-player-video]");
  var button = document.querySelector("[data-player-button]");
  var message = document.querySelector("[data-player-message]");
  var hlsInstance = null;
  var initialized = false;

  if (!video || !button) {
    return;
  }

  var showMessage = function (text) {
    if (message) {
      message.textContent = text || "";
    }
  };

  var initVideo = function () {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;
    var source = video.getAttribute("data-source") || "";

    if (!source) {
      showMessage("播放源暂不可用");
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage("播放遇到异常，请刷新后重试");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }

    return Promise.resolve();
  };

  var playVideo = function () {
    button.classList.add("is-hidden");
    initVideo().then(function () {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
          showMessage("点击播放按钮继续观看");
        });
      }
    });
  };

  button.addEventListener("click", playVideo);

  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
    showMessage("");
  });

  video.addEventListener("pause", function () {
    if (!video.ended) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
