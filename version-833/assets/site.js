(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
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

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

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

    restart();
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var typeSelect = panel.querySelector('[data-type-filter]');
    var list = document.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function applyFilter() {
      var keyword = valueOf(input);
      var year = valueOf(yearSelect);
      var type = valueOf(typeSelect);

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || String(card.getAttribute('data-year')).toLowerCase() === year;
        var matchedType = !type || String(card.getAttribute('data-type')).toLowerCase() === type;

        card.classList.toggle('is-filtered-out', !(matchedKeyword && matchedYear && matchedType));
      });
    }

    [input, yearSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });
  });
}());
