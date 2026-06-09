(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function initMobileNav() {
    var button = document.querySelector('.mobile-toggle');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = document.body.classList.toggle('mobile-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initGridFilters() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var search = document.querySelector('[data-page-search]');
    var region = document.querySelector('[data-filter-region]');
    var sort = document.querySelector('[data-sort-grid]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    cards.forEach(function (card, index) {
      card.dataset.index = String(index);
    });
    function apply() {
      var query = normalize(search && search.value);
      var selectedRegion = normalize(region && region.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
        card.style.display = matchedQuery && matchedRegion ? '' : 'none';
      });
      if (sort && sort.value !== 'default') {
        var visible = cards.slice().sort(function (a, b) {
          if (sort.value === 'year') {
            return normalize(b.dataset.year).localeCompare(normalize(a.dataset.year), 'zh-Hans-CN', { numeric: true });
          }
          return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN');
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      } else {
        cards.slice().sort(function (a, b) {
          return Number(a.dataset.index) - Number(b.dataset.index);
        }).forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }
    [search, region, sort].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = normalize(params.get('q'));
    var input = document.querySelector('[data-search-input]');
    var heading = document.querySelector('[data-search-heading]');
    if (input) {
      input.value = params.get('q') || '';
    }
    var pool = window.SEARCH_MOVIES.filter(function (movie) {
      if (!q) {
        return movie.hot;
      }
      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ')).indexOf(q) !== -1;
    }).slice(0, q ? 160 : 48);
    if (heading) {
      heading.textContent = q ? '搜索结果：' + (params.get('q') || '') : '热门推荐';
    }
    results.textContent = '';
    pool.forEach(function (movie) {
      var article = document.createElement('article');
      article.className = 'movie-card compact-card';
      article.dataset.title = movie.title;
      article.dataset.region = movie.region;
      article.dataset.type = movie.type;
      article.dataset.year = movie.year;
      article.dataset.genre = movie.genre;

      var posterLink = document.createElement('a');
      posterLink.className = 'poster-link';
      posterLink.href = movie.url;

      var poster = document.createElement('span');
      poster.className = 'poster-wrap';

      var img = document.createElement('img');
      img.src = movie.cover;
      img.alt = movie.title;
      img.loading = 'lazy';
      img.onerror = function () {
        img.classList.add('is-missing');
      };

      var shade = document.createElement('span');
      shade.className = 'poster-shade';

      var play = document.createElement('span');
      play.className = 'play-pill';
      play.textContent = '▶';

      var year = document.createElement('span');
      year.className = 'poster-year';
      year.textContent = movie.year;

      poster.appendChild(img);
      poster.appendChild(shade);
      poster.appendChild(play);
      poster.appendChild(year);
      posterLink.appendChild(poster);

      var body = document.createElement('div');
      body.className = 'movie-card-body';

      var h2 = document.createElement('h2');
      var titleLink = document.createElement('a');
      titleLink.href = movie.url;
      titleLink.textContent = movie.title;
      h2.appendChild(titleLink);

      var summary = document.createElement('p');
      summary.textContent = movie.oneLine;

      var meta = document.createElement('div');
      meta.className = 'movie-meta';
      [movie.region, movie.type, movie.genre].forEach(function (value) {
        var span = document.createElement('span');
        span.textContent = value;
        meta.appendChild(span);
      });

      body.appendChild(h2);
      body.appendChild(summary);
      body.appendChild(meta);
      article.appendChild(posterLink);
      article.appendChild(body);
      results.appendChild(article);
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-play');
      if (!video || !button) {
        return;
      }
      var source = video.querySelector('source');
      var url = source ? source.getAttribute('src') : video.getAttribute('src');
      var started = false;
      var hlsInstance = null;
      function prepare() {
        if (started) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            maxBufferLength: 30
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
        started = true;
      }
      function play() {
        prepare();
        shell.classList.add('is-playing');
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      button.addEventListener('click', play);
      shell.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initGridFilters();
    initSearchPage();
    initPlayers();
  });
})();
