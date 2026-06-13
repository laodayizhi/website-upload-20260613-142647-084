(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var active = 0;
      var timer = null;

      function showSlide(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      function startHero() {
        stopHero();
        timer = window.setInterval(function () {
          showSlide(active + 1);
        }, 5200);
      }

      function stopHero() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startHero();
        });
      });

      hero.addEventListener("mouseenter", stopHero);
      hero.addEventListener("mouseleave", startHero);
      startHero();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));

    function applySearch(value) {
      var keyword = String(value || "").trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-meta") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        card.classList.toggle("is-hidden", keyword.length > 0 && haystack.indexOf(keyword) === -1);
      });
    }

    if (searchInputs.length && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      searchInputs.forEach(function (input) {
        if (input.hasAttribute("data-search-sync")) {
          input.value = q;
        }
        input.addEventListener("input", function () {
          applySearch(input.value);
        });
      });
      applySearch(q);
    }

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var source = video ? video.getAttribute("data-src") : "";
      var hls = null;
      var prepared = false;

      function prepare() {
        if (!video || !source || prepared) {
          return;
        }
        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function playMovie() {
        prepare();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      if (cover && video) {
        cover.addEventListener("click", playMovie);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playMovie();
          }
        });
        video.addEventListener("play", function () {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
