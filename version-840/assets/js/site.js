(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
            document.body.classList.toggle("is-menu-open", mobileMenu.classList.contains("is-open"));
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let index = 0;

        const activate = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const nextIndex = Number(dot.getAttribute("data-hero-dot"));
                activate(nextIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                activate(index + 1);
            }, 5200);
        }
    }

    const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    scopes.forEach(function (scope) {
        const input = scope.querySelector("[data-filter-input]");
        const items = Array.from(scope.querySelectorAll("[data-search-item]"));
        const empty = scope.querySelector("[data-empty-state]");

        if (!input || items.length === 0) {
            return;
        }

        if (query && input.name === "q") {
            input.value = query;
        }

        const filter = function () {
            const value = input.value.trim().toLowerCase();
            let visible = 0;

            items.forEach(function (item) {
                const text = item.textContent.toLowerCase();
                const match = value === "" || text.includes(value);
                item.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        input.addEventListener("input", filter);
        filter();
    });
})();
