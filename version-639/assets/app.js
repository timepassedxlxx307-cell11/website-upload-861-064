(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    var showSlide = function (nextIndex) {
      current = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle("is-active", index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var searchPage = document.querySelector("[data-search-page]");

  if (searchPage) {
    var input = searchPage.querySelector("[data-search-input]");
    var year = searchPage.querySelector("[data-filter-year]");
    var region = searchPage.querySelector("[data-filter-region]");
    var type = searchPage.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(searchPage.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    var runFilter = function () {
      var query = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }

        if (typeValue && cardType !== typeValue) {
          matched = false;
        }

        card.classList.toggle("is-filtered-out", !matched);
      });
    };

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", runFilter);
        control.addEventListener("change", runFilter);
      }
    });

    runFilter();
  }
})();
