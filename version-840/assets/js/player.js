(function () {
    window.setupMoviePlayer = function (sourceUrl) {
        const video = document.getElementById("movie-video");
        const overlay = document.querySelector("[data-play-overlay]");
        let mounted = false;
        let hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        const mount = function () {
            if (mounted) {
                return;
            }

            mounted = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        };

        const start = function () {
            mount();

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            const playTask = video.play();

            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        };

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
