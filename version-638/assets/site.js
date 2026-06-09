(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function initFilters() {
    all('[data-filter-scope]').forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var region = panel.querySelector('[data-region-filter]');
      var type = panel.querySelector('[data-type-filter]');
      var grid = document.querySelector('[data-card-grid]');
      var empty = panel.querySelector('[data-empty-state]');
      if (!grid) {
        return;
      }
      var cards = all('[data-card]', grid);

      function applyFilter(extraTerm) {
        var query = text(extraTerm || (input && input.value));
        var regionValue = text(region && region.value);
        var typeValue = text(type && type.value);
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesRegion = !regionValue || text(card.getAttribute('data-region')) === regionValue;
          var matchesType = !typeValue || text(card.getAttribute('data-type')) === typeValue;
          var visible = matchesQuery && matchesRegion && matchesType;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [input, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', function () {
            applyFilter();
          });
          control.addEventListener('change', function () {
            applyFilter();
          });
        }
      });

      all('[data-quick-filter]', panel).forEach(function (button) {
        button.addEventListener('click', function () {
          if (input) {
            input.value = button.getAttribute('data-quick-filter') || '';
          }
          applyFilter(button.getAttribute('data-quick-filter'));
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
