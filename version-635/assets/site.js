(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector("#siteNav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHeroSlider() {
        var root = document.querySelector("[data-hero-slider]");
        if (!root) {
            return;
        }
        var slides = selectAll(".hero-slide", root);
        var dots = selectAll(".hero-dot", root);
        var previous = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-index")) || 0);
                start();
            });
        });
        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function initCardFilters() {
        selectAll("[data-card-filter]").forEach(function (panel) {
            var scope = panel.parentElement;
            var input = panel.querySelector("[data-filter-input]");
            var buttons = selectAll("[data-filter-region]", panel);
            var list = scope ? scope.querySelector("[data-filter-list]") : null;
            if (!list) {
                return;
            }
            var cards = selectAll("[data-text]", list);
            var activeRegion = "";
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-text") || "").toLowerCase();
                    var region = card.getAttribute("data-region") || "";
                    var matchedRegion = !activeRegion || region === activeRegion;
                    var matchedText = !keyword || text.indexOf(keyword) !== -1;
                    card.classList.toggle("is-filtered-out", !(matchedRegion && matchedText));
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeRegion = button.getAttribute("data-filter-region") || "";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
        });
    }

    function initSearchPage() {
        var root = document.querySelector("[data-search-page]");
        if (!root || !window.MOVIES) {
            return;
        }
        var input = root.querySelector("#siteSearchInput");
        var results = root.querySelector("[data-search-results]");
        var status = root.querySelector("[data-search-status]");
        if (!input || !results || !status) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function card(movie) {
            return [
                "<article class=\"movie-card movie-card-compact\">",
                "<a class=\"poster-wrap\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "<span class=\"poster-shadow\"></span>",
                "<span class=\"duration-badge\">" + escapeHtml(movie.duration) + "</span>",
                "<span class=\"play-glow\">▶</span>",
                "</a>",
                "<div class=\"movie-card-body\">",
                "<div class=\"card-meta-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
                "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
                "<p>" + escapeHtml(movie.oneLine) + "</p>",
                "<div class=\"card-info-row\"><span>" + escapeHtml(movie.genre) + "</span><span>" + escapeHtml(movie.score) + " 分</span></div>",
                "</div>",
                "</article>"
            ].join("");
        }
        function render(keyword) {
            var value = keyword.trim().toLowerCase();
            var matches = window.MOVIES.filter(function (movie) {
                return !value || movie.searchText.toLowerCase().indexOf(value) !== -1;
            }).slice(0, 120);
            if (!matches.length) {
                status.textContent = "没有找到匹配影片";
                results.innerHTML = "";
                return;
            }
            status.textContent = value ? "搜索结果" : "精选内容";
            results.innerHTML = matches.map(card).join("");
        }
        input.addEventListener("input", function () {
            render(input.value);
        });
        render(initial);
    }

    function initMoviePlayer(source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        var shell = document.getElementById("playerShell");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            load();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (shell) {
            shell.addEventListener("click", function (event) {
                if (event.target === video) {
                    play();
                }
            });
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("emptied", function () {
            loaded = false;
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHeroSlider();
        initCardFilters();
        initSearchPage();
    });
})();
