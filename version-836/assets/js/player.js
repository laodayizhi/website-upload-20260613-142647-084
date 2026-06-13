(function () {
    window.createMoviePlayer = function (streamUrl) {
        var video = document.querySelector("[data-movie-video]");
        var cover = document.querySelector("[data-player-cover]");
        var button = document.querySelector("[data-player-button]");
        var hlsInstance = null;

        function attachStream() {
            if (!video || video.getAttribute("data-ready") === "1") {
                return;
            }
            video.setAttribute("data-ready", "1");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = streamUrl;
        }

        function playVideo() {
            if (!video) {
                return;
            }
            attachStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }
        if (cover && cover !== button) {
            cover.addEventListener("click", playVideo);
        }
        if (video) {
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
        }
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
