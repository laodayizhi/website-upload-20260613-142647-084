(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector(".hero");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      restart();
    }

    var searchRoot = document.querySelector("[data-search-results]");

    if (searchRoot && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var keyword = (params.get("q") || "").trim();
      var input = document.querySelector("[data-search-input]");
      var message = document.querySelector("[data-search-message]");

      if (input) {
        input.value = keyword;
      }

      var lower = keyword.toLowerCase();
      var results = lower ? window.SEARCH_MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags].join(" ").toLowerCase().indexOf(lower) !== -1;
      }) : window.SEARCH_MOVIES.slice(0, 60);

      if (message) {
        message.textContent = keyword ? "搜索结果" : "热门片单";
      }

      searchRoot.innerHTML = results.slice(0, 120).map(function (movie) {
        return [
          "<a class=\"video-card\" href=\"movies/" + movie.file + "\">",
          "  <div class=\"poster-frame\">",
          "    <img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
          "    <span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>",
          "  </div>",
          "  <div class=\"video-card-body\">",
          "    <h3>" + escapeHtml(movie.title) + "</h3>",
          "    <div class=\"tag-row\"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
          "    <div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
          "  </div>",
          "</a>"
        ].join("");
      }).join("");
    }
  });

  function escapeHtml(text) {
    return String(text).replace(/[&<>\"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }

  window.initMoviePlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function attach() {
      if (video.getAttribute("data-ready") === "yes") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
      } else {
        video.src = streamUrl;
      }

      video.setAttribute("data-ready", "yes");
    }

    function start() {
      attach();
      overlay.classList.add("is-hidden");
      video.controls = true;

      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
