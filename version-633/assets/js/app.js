(function () {
  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = toArray(root.querySelectorAll("[data-hero-slide]"));
    var dots = toArray(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var panel = document.querySelector("[data-search-panel]");
    var data = window.siteMovies || [];

    if (!input || !panel || !data.length) {
      return;
    }

    function render(items) {
      panel.innerHTML = items.map(function (item) {
        return '<a class="search-result" href="' + item.url + '">' +
          '<strong>' + item.title + '</strong>' +
          '<span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span>' +
          '</a>';
      }).join("");
      panel.classList.toggle("open", items.length > 0);
    }

    input.addEventListener("input", function () {
      var keyword = text(input.value).trim();

      if (!keyword) {
        render([]);
        return;
      }

      var results = data.filter(function (item) {
        return text(item.title).indexOf(keyword) >= 0 ||
          text(item.region).indexOf(keyword) >= 0 ||
          text(item.genre).indexOf(keyword) >= 0 ||
          text(item.tags).indexOf(keyword) >= 0 ||
          text(item.oneLine).indexOf(keyword) >= 0;
      }).slice(0, 12);

      render(results);
    });

    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove("open");
      }
    });
  }

  function initLocalFilter() {
    var grid = document.querySelector("[data-card-grid]");

    if (!grid) {
      return;
    }

    var input = document.querySelector("[data-filter-input]");
    var year = document.querySelector("[data-filter-year]");
    var region = document.querySelector("[data-filter-region]");
    var cards = toArray(grid.querySelectorAll(".movie-card"));

    function apply() {
      var keyword = input ? text(input.value).trim() : "";
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value : "";

      cards.forEach(function (card) {
        var content = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].map(text).join(" ");

        var matchKeyword = !keyword || content.indexOf(keyword) >= 0;
        var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var matchRegion = !selectedRegion || card.getAttribute("data-region").indexOf(selectedRegion) >= 0;

        card.classList.toggle("is-hidden-by-filter", !(matchKeyword && matchYear && matchRegion));
      });
    }

    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function initImages() {
    toArray(document.querySelectorAll("img")).forEach(function (image) {
      image.addEventListener("error", function () {
        var frame = image.closest(".poster-frame");

        if (frame) {
          frame.classList.add("image-empty");
        }
      }, { once: true });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initLocalFilter();
    initImages();
  });
})();
