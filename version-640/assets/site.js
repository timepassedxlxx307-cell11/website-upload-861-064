(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });
        window.setInterval(function () {
            show((index + 1) % slides.length);
        }, 5200);
    }

    function regionMatch(region, value) {
        if (!value) {
            return true;
        }
        if (value === "日韩") {
            return /日本|韩国|日韩|泰国/.test(region);
        }
        if (value === "中国") {
            return /中国|大陆|香港|台湾|内地/.test(region);
        }
        if (value === "欧美") {
            return /美国|英国|法国|德国|西班牙|意大利|俄罗斯|加拿大|欧美|欧洲/.test(region);
        }
        return true;
    }

    function yearMatch(year, value) {
        var number = parseInt(year, 10);
        if (!value || !number) {
            return true;
        }
        if (value === "new") {
            return number >= 2025;
        }
        if (value === "2024") {
            return number === 2024;
        }
        if (value === "2023") {
            return number === 2023;
        }
        if (value === "2020-2022") {
            return number >= 2020 && number <= 2022;
        }
        if (value === "older") {
            return number < 2020;
        }
        return true;
    }

    function typeMatch(type, value) {
        if (!value) {
            return true;
        }
        if (value === "剧") {
            return /剧|TV|Series|网剧|短剧/.test(type);
        }
        if (value === "动漫") {
            return /动画|动漫/.test(type);
        }
        return type.indexOf(value) !== -1;
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var values = {};
                selects.forEach(function (select) {
                    values[select.getAttribute("data-filter-field")] = select.value;
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var region = card.getAttribute("data-region") || "";
                    var type = card.getAttribute("data-type") || "";
                    var year = card.getAttribute("data-year") || "";
                    var matched = (!keyword || text.indexOf(keyword) !== -1) && regionMatch(region, values.region || "") && typeMatch(type, values.type || "") && yearMatch(year, values.year || "");
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
