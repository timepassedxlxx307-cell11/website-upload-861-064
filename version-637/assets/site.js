import { H as Hls } from './hls-vendor-dru42stk.js';

const ready = (fn) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
};

const normalize = (value) => (value || '').toString().trim().toLowerCase();

const setupMenu = () => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
    });
};

const setupHero = () => {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === index);
        });
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => show(dotIndex));
    });

    if (slides.length > 1) {
        window.setInterval(() => show(index + 1), 5800);
    }
};

const getQueryParam = () => {
    const params = new URLSearchParams(window.location.search);
    return normalize(params.get('q'));
};

const filterCards = (query) => {
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const note = document.querySelector('[data-result-note]');

    if (!cards.length) {
        return;
    }

    let visible = 0;
    cards.forEach((card) => {
        const text = normalize(card.getAttribute('data-search'));
        const matched = !query || text.includes(query);
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
            visible += 1;
        }
    });

    if (note) {
        note.textContent = query ? `已筛选出 ${visible} 部相关影片` : '';
    }
};

const setupSearch = () => {
    const pageQuery = getQueryParam();
    const globalInput = document.querySelector('[data-global-search-input]');

    if (globalInput && pageQuery) {
        globalInput.value = pageQuery;
    }

    filterCards(pageQuery);

    document.querySelectorAll('[data-local-filter]').forEach((form) => {
        const input = form.querySelector('[data-local-filter-input]');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            filterCards(normalize(input ? input.value : ''));
        });
        if (input) {
            input.addEventListener('input', () => filterCards(normalize(input.value)));
        }
    });
};

const setupPlayer = () => {
    const video = document.querySelector('[data-player-video]');
    const trigger = document.querySelector('[data-player-start]');

    if (!video || !trigger) {
        return;
    }

    const source = trigger.getAttribute('data-hls-url');
    let started = false;
    let hls = null;

    const start = () => {
        if (!source) {
            return;
        }

        trigger.classList.add('is-hidden');

        if (started) {
            video.play().catch(() => {});
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(() => {});
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });
            return;
        }

        video.src = source;
        video.play().catch(() => {});
    };

    trigger.addEventListener('click', start);
    video.addEventListener('click', () => {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', () => {
        trigger.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', () => {
        if (hls) {
            hls.destroy();
        }
    });
};

ready(() => {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayer();
});
