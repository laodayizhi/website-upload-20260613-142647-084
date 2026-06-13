(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var dotsWrap = hero.querySelector('[data-hero-dots]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            if (dotsWrap) {
                Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        if (dotsWrap) {
            slides.forEach(function (_, dotIndex) {
                var dot = document.createElement('button');
                dot.className = 'hero-dot';
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换影片');
                dot.addEventListener('click', function () {
                    showSlide(dotIndex);
                    restart();
                });
                dotsWrap.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        showSlide(0);
        restart();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-year') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();

                card.classList.toggle('is-filtered-out', keyword && haystack.indexOf(keyword) === -1);
            });
        });
    });

    var scrollPlayer = document.querySelector('[data-scroll-player]');
    var playerShell = document.querySelector('[data-player]');

    if (scrollPlayer && playerShell) {
        scrollPlayer.addEventListener('click', function (event) {
            event.preventDefault();
            playerShell.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var button = playerShell.querySelector('[data-play-button]');

            if (button) {
                window.setTimeout(function () {
                    button.click();
                }, 380);
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var stream = shell.getAttribute('data-stream');
        var attached = false;

        function attach() {
            if (!video || !stream || attached) {
                return;
            }

            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }
        }

        function play() {
            attach();

            if (button) {
                button.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button && video) {
            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }
    });
})();
