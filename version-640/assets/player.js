(function () {
    function playVideo(video) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function bindHls(video, source) {
        if (video.getAttribute("data-loaded") === "true") {
            return;
        }
        video.setAttribute("data-loaded", "true");
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
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
            video._hlsPlayer = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    window.initMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        if (!video || !button || !config.source) {
            return;
        }
        if (config.poster) {
            video.setAttribute("poster", config.poster);
        }
        function start() {
            bindHls(video, config.source);
            button.classList.add("is-hidden");
            playVideo(video);
        }
        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
    };
})();
