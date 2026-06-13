(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initImages() {
        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-missing');
            }, { once: true });
        });
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-hero-thumb]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('is-active', i === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('mouseenter', function () {
                show(index);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function initFilters() {
        document.querySelectorAll('.catalog-tools').forEach(function (panel) {
            var searchInput = panel.querySelector('[data-filter-search]');
            var categorySelect = panel.querySelector('[data-filter-category]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var resetButton = panel.querySelector('[data-filter-reset]');
            var countTarget = panel.querySelector('[data-result-count]');
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var url = new URL(window.location.href);
            var query = url.searchParams.get('q') || '';

            if (searchInput && query) {
                searchInput.value = query;
            }

            function applyFilters() {
                var keyword = normalize(searchInput && searchInput.value);
                var category = normalize(categorySelect && categorySelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var index = normalize(card.getAttribute('data-search-index'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var match = true;

                    if (keyword && index.indexOf(keyword) === -1) {
                        match = false;
                    }
                    if (category && cardCategory !== category) {
                        match = false;
                    }
                    if (type && cardType !== type) {
                        match = false;
                    }
                    if (year && cardYear !== year) {
                        match = false;
                    }

                    card.classList.toggle('is-hidden', !match);
                    if (match) {
                        visible += 1;
                    }
                });

                if (countTarget) {
                    countTarget.textContent = visible;
                }
            }

            [searchInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilters);
                    control.addEventListener('change', applyFilters);
                }
            });

            if (resetButton) {
                resetButton.addEventListener('click', function () {
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    if (categorySelect) {
                        categorySelect.value = '';
                    }
                    if (typeSelect) {
                        typeSelect.value = '';
                    }
                    if (yearSelect) {
                        yearSelect.value = '';
                    }
                    applyFilters();
                });
            }

            applyFilters();
        });
    }

    function initSearchForms() {
        document.querySelectorAll('.nav-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function initPlayer() {
        var video = document.querySelector('.js-player');
        if (!video) {
            return;
        }

        var source = video.getAttribute('data-video-url');
        var overlay = document.querySelector('.js-play-overlay');
        var status = document.querySelector('[data-player-status]');
        var playButton = document.querySelector('[data-player-play]');
        var muteButton = document.querySelector('[data-player-mute]');
        var fullscreenButton = document.querySelector('[data-player-fullscreen]');
        var hlsInstance = null;
        var isLoaded = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function loadSource() {
            if (isLoaded || !source) {
                return Promise.resolve();
            }
            isLoaded = true;
            setStatus('正在加载 HLS 播放源...');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('播放源已就绪，可正常播放。');
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放器加载遇到问题，请刷新或稍后重试。');
                    }
                });
                return Promise.resolve();
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('浏览器原生 HLS 播放源已就绪。');
                return Promise.resolve();
            }

            video.src = source;
            setStatus('已绑定播放源，当前浏览器可能需要 HLS 支持。');
            return Promise.resolve();
        }

        function play() {
            loadSource().then(function () {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
                    });
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                overlay.classList.add('is-hidden');
                play();
            });
        }

        if (playButton) {
            playButton.addEventListener('click', function () {
                if (video.paused) {
                    if (overlay) {
                        overlay.classList.add('is-hidden');
                    }
                    play();
                } else {
                    video.pause();
                }
            });
        }

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                setStatus(video.muted ? '已静音。' : '已取消静音。');
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function () {
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
            });
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initImages();
        initMenu();
        initHero();
        initFilters();
        initSearchForms();
        initPlayer();
    });
})();
