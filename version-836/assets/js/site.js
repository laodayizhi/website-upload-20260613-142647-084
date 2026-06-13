(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (toggle && mobileMenu) {
        toggle.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function updateFilterScope(scope) {
        var input = scope.querySelector("[data-filter-input]");
        var year = scope.querySelector("[data-filter-year]");
        var region = scope.querySelector("[data-filter-region]");
        var type = scope.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        var count = scope.querySelector("[data-filter-count]");
        var query = normalize(input && input.value);
        var yearValue = year ? year.value : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var ok = true;
            if (query && text.indexOf(query) === -1) {
                ok = false;
            }
            if (yearValue && card.getAttribute("data-year") !== yearValue) {
                ok = false;
            }
            if (regionValue && card.getAttribute("data-region") !== regionValue) {
                ok = false;
            }
            if (typeValue && card.getAttribute("data-type") !== typeValue) {
                ok = false;
            }
            card.hidden = !ok;
            if (ok) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = visible + " 部影片";
        }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
        Array.prototype.slice.call(scope.querySelectorAll("input, select")).forEach(function (control) {
            control.addEventListener("input", function () {
                updateFilterScope(scope);
            });
            control.addEventListener("change", function () {
                updateFilterScope(scope);
            });
        });
        updateFilterScope(scope);
    });

    var searchScope = document.querySelector("[data-search-scope]");
    if (searchScope) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var searchInput = searchScope.querySelector("[data-search-input]");
        var searchCount = searchScope.querySelector("[data-search-count]");
        var searchCards = Array.prototype.slice.call(searchScope.querySelectorAll("[data-movie-card]"));
        if (searchInput) {
            searchInput.value = q;
        }

        function updateSearch() {
            var query = normalize(searchInput && searchInput.value);
            var visible = 0;
            searchCards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var ok = !query || text.indexOf(query) !== -1;
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (searchCount) {
                searchCount.textContent = visible + " 部影片";
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", updateSearch);
        }
        updateSearch();
    }
})();
