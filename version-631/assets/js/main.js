(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = panel.hasAttribute("hidden") === false;
      if (isOpen) {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  }

  function initHero() {
    var carousel = document.getElementById("heroCarousel");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var previous = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    if (previous) {
      previous.addEventListener("click", function () {
        move(-1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
        start();
      });
    }
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initInlineFilter() {
    var input = document.querySelector(".inline-filter");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var source = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
        card.hidden = keyword.length > 0 && source.indexOf(keyword) === -1;
      });
    });
  }

  function buildSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"card-poster\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"card-type\">" + escapeHtml(movie.type) + "</span>",
      "<span class=\"card-play\">▶</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
      "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    var title = document.getElementById("searchTitle");
    var note = document.getElementById("searchNote");
    var input = document.getElementById("searchInput");
    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
      input.addEventListener("input", function () {
        render(input.value.trim());
      });
    }
    render(query);

    function render(keyword) {
      var normalized = keyword.toLowerCase();
      if (!normalized) {
        results.innerHTML = "";
        if (title) {
          title.textContent = "影片搜索";
        }
        if (note) {
          note.textContent = "输入关键词后即可查看匹配结果。";
        }
        return;
      }
      var list = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        return movie.search.indexOf(normalized) !== -1;
      }).slice(0, 80);
      if (title) {
        title.textContent = "搜索结果";
      }
      if (note) {
        note.textContent = "关键词：“" + keyword + "”";
      }
      if (!list.length) {
        results.innerHTML = "<div class=\"no-results\">没有找到匹配的影片。</div>";
        return;
      }
      results.innerHTML = list.map(buildSearchCard).join("");
    }
  }

  window.initMoviePlayer = function (videoId, coverId, playId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var play = document.getElementById(playId);
    if (!video || !cover || !sourceUrl) {
      return;
    }
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function start() {
      prepare();
      cover.classList.add("hidden");
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          cover.classList.remove("hidden");
        });
      }
    }

    cover.addEventListener("click", start);
    if (play) {
      play.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initInlineFilter();
    initSearchPage();
  });
})();
