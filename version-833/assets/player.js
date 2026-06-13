(function () {
  function initMoviePlayer(source) {
    var video = document.getElementById('movie-video');
    var cover = document.querySelector('[data-player-cover]');
    var loaded = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function attachSource() {
      if (loaded) {
        hideCover();
        playVideo();
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      }

      hideCover();
    }

    if (cover) {
      cover.addEventListener('click', attachSource);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        attachSource();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
}());
