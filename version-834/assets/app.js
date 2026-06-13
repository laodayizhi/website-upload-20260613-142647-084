(function () {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initNavigation() {
    const toggle = qs('.nav-toggle');
    const mobile = qs('.mobile-nav');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  function initHero() {
    const slides = qsa('.hero-slide');
    const dots = qsa('.hero-dot');
    if (!slides.length) {
      return;
    }
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    const next = qs('.hero-next');
    const prev = qs('.hero-prev');
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.slide || 0));
        restart();
      });
    });
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initSearchForms() {
    qsa('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        const input = qs('input[name="q"]', form);
        const value = input ? input.value.trim() : '';
        if (!value) {
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      });
    });
  }

  function initFilters() {
    const lists = qsa('.filter-list');
    if (!lists.length) {
      return;
    }
    const search = qs('.local-search');
    const year = qs('.year-filter');
    const type = qs('.type-filter');
    const empty = qs('.filter-empty');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    if (search && query) {
      search.value = query;
    }

    function apply() {
      const keyword = normalize(search ? search.value : '');
      const yearValue = year ? year.value : '';
      const typeValue = normalize(type ? type.value : '');
      let visible = 0;
      qsa('.movie-card').forEach(function (card) {
        const searchText = normalize(card.dataset.search || card.textContent);
        const cardYear = String(card.dataset.year || '');
        const cardType = normalize(card.dataset.type || '');
        const byKeyword = !keyword || searchText.includes(keyword);
        const byYear = !yearValue || cardYear === yearValue;
        const byType = !typeValue || cardType.includes(typeValue) || searchText.includes(typeValue);
        const matched = byKeyword && byYear && byType;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function initPlayer() {
    qsa('.player-shell').forEach(function (shell) {
      const video = qs('video', shell);
      const button = qs('.player-start', shell);
      const src = shell.dataset.src;
      if (!video || !src) {
        return;
      }

      function ensureReady() {
        if (video.dataset.ready === 'true') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
        video.dataset.ready = 'true';
      }

      function play() {
        ensureReady();
        shell.classList.add('is-playing');
        const promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          shell.classList.remove('is-playing');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initSearchForms();
    initFilters();
    initPlayer();
  });
})();
