(function () {
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const nextButton = hero.querySelector('[data-hero-next]');
    const prevButton = hero.querySelector('[data-hero-prev]');
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const startTimer = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (slides.length > 1) {
      startTimer();
    }
  }

  const scopes = Array.from(document.querySelectorAll('[data-search-scope]'));

  scopes.forEach(function (scope) {
    const input = scope.querySelector('[data-search-input]');
    const genre = scope.querySelector('[data-filter-genre]');
    const region = scope.querySelector('[data-filter-region]');
    const year = scope.querySelector('[data-filter-year]');
    const category = scope.querySelector('[data-filter-category]');
    const reset = scope.querySelector('[data-filter-reset]');
    const empty = scope.querySelector('[data-empty-state]');
    const cards = Array.from(scope.querySelectorAll('.movie-card'));

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const apply = function () {
      const query = normalize(input && input.value);
      const genreValue = normalize(genre && genre.value);
      const regionValue = normalize(region && region.value);
      const yearValue = normalize(year && year.value);
      const categoryValue = normalize(category && category.value);
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type
        ].join(' '));
        const matchQuery = !query || text.indexOf(query) !== -1;
        const matchGenre = !genreValue || normalize(card.dataset.genre).indexOf(genreValue) !== -1;
        const matchRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
        const matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
        const matchCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
        const show = matchQuery && matchGenre && matchRegion && matchYear && matchCategory;

        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, genre, region, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        [genre, region, year, category].forEach(function (select) {
          if (select) {
            select.value = '';
          }
        });
        apply();
      });
    }

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q && input) {
      input.value = q;
      apply();
    }
  });

  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.play-overlay');
    const videoUrl = player.getAttribute('data-video');
    let started = false;
    let hlsInstance = null;

    const playVideo = function () {
      if (!video || !videoUrl) {
        return;
      }

      if (!started) {
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = videoUrl;
        }
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', playVideo);
      overlay.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          playVideo();
        }
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          playVideo();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
