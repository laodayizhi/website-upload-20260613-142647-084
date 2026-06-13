(function () {
    var root = document.documentElement.getAttribute('data-root') || '';

    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupImages() {
        selectAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function setupPageFilter() {
        var input = document.querySelector('.js-page-search');
        if (!input) {
            return;
        }
        var cards = selectAll('[data-movie-card]');
        var counter = document.querySelector('.js-filter-count');
        function apply() {
            var keyword = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle('hidden-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (counter) {
                counter.textContent = visible + ' 部可见';
            }
        }
        input.addEventListener('input', apply);
        apply();
    }

    function setupQuickSearch() {
        var form = document.querySelector('[data-quick-search-form]');
        if (!form) {
            return;
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = encodeURIComponent((input && input.value) || '');
            window.location.href = root + 'search.html?q=' + query;
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderSearchCard(item) {
        var href = root + item.url;
        var cover = root + item.cover;
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ');
        return '<article class="movie-card" data-movie-card data-search="' + escapeHtml(text) + '">' +
            '<a class="cover-shell" data-title="' + escapeHtml(item.title) + '" href="' + escapeHtml(href) + '">' +
            '<img src="' + escapeHtml(cover) + '" alt="' + escapeHtml(item.title) + '">' +
            '<span class="type-badge">' + escapeHtml(item.type) + '</span>' +
            '<span class="score-badge">' + escapeHtml(item.score) + '</span>' +
            '</a>' +
            '<div class="card-body">' +
            '<a class="card-title" href="' + escapeHtml(href) + '">' + escapeHtml(item.title) + '</a>' +
            '<p class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.genre) + '</p>' +
            '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>' +
            '</div>' +
            '</article>';
    }

    function setupSearchPage() {
        var input = document.querySelector('[data-global-search]');
        var region = document.querySelector('[data-global-region]');
        var year = document.querySelector('[data-global-year]');
        var results = document.querySelector('[data-search-results]');
        var total = document.querySelector('[data-search-total]');
        if (!input || !results) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;
        var dataset = [];
        function apply() {
            var keyword = normalize(input.value);
            var regionValue = region ? region.value : '';
            var yearValue = year ? year.value : '';
            var filtered = dataset.filter(function (item) {
                var text = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' '));
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okRegion = !regionValue || item.region === regionValue;
                var okYear = !yearValue || item.year === yearValue;
                return okKeyword && okRegion && okYear;
            }).slice(0, 300);
            if (total) {
                total.textContent = filtered.length + ' 条结果';
            }
            if (!filtered.length) {
                results.innerHTML = '<div class="search-results-empty">没有找到匹配内容</div>';
                return;
            }
            results.innerHTML = filtered.map(renderSearchCard).join('');
            setupImages();
        }
        fetch(root + 'assets/data/search-index.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (items) {
                dataset = items;
                apply();
            })
            .catch(function () {
                dataset = [];
                apply();
            });
        input.addEventListener('input', apply);
        if (region) {
            region.addEventListener('change', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
    }

    function setupPlayer() {
        selectAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('[data-play-button]');
            var source = player.getAttribute('data-src') || (video && video.getAttribute('data-src'));
            var hls = null;
            if (!video || !source) {
                return;
            }
            function bindSource() {
                if (video.getAttribute('data-bound') === '1') {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            if (player.classList.contains('is-playing')) {
                                var playAgain = video.play();
                                if (playAgain && typeof playAgain.catch === 'function') {
                                    playAgain.catch(function () {});
                                }
                            }
                        });
                    }
                } else {
                    video.src = source;
                }
                video.setAttribute('data-bound', '1');
            }
            function start() {
                bindSource();
                player.classList.add('is-playing');
                video.setAttribute('controls', 'controls');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }
            if (overlay) {
                overlay.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupImages();
        setupHero();
        setupQuickSearch();
        setupPageFilter();
        setupSearchPage();
        setupPlayer();
    });
})();
