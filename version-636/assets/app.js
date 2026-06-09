import { H as Hls } from "./hls-vendor-dru42stk.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const setupMenu = () => {
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
};

const setupHero = () => {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;
  const setActive = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };
  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => setActive(index + 1), 5200);
  };
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      setActive(Number(dot.dataset.heroDot || 0));
      start();
    });
  });
  hero.addEventListener("mouseenter", () => window.clearInterval(timer));
  hero.addEventListener("mouseleave", start);
  start();
};

const setupSearch = () => {
  document.querySelectorAll(".search-panel").forEach((panel) => {
    const input = panel.querySelector("[data-search-input]");
    const clear = panel.querySelector("[data-search-clear]");
    const container = panel.parentElement || document;
    const scope = container.querySelector("[data-search-scope]:not(.search-panel)") || document;
    const cards = Array.from(scope.querySelectorAll("[data-card]"));
    if (!input || !cards.length) {
      return;
    }
    const apply = () => {
      const query = normalize(input.value);
      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags,
          card.textContent
        ].join(" "));
        card.classList.toggle("is-hidden", Boolean(query) && !haystack.includes(query));
      });
    };
    input.addEventListener("input", apply);
    if (clear) {
      clear.addEventListener("click", () => {
        input.value = "";
        apply();
        input.focus();
      });
    }
  });
};

const setupPlayers = () => {
  document.querySelectorAll("[data-player]").forEach((player) => {
    const video = player.querySelector("video[data-src]");
    const button = player.querySelector("[data-player-start]");
    if (!video || !button) {
      return;
    }
    let initialized = false;
    const initialize = () => {
      const source = video.dataset.src;
      if (!source) {
        return;
      }
      if (!initialized) {
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else {
          video.src = source;
        }
      }
      player.classList.add("is-ready");
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          video.controls = true;
        });
      }
    };
    button.addEventListener("click", initialize);
    video.addEventListener("click", initialize, { once: true });
  });
};

ready(() => {
  setupMenu();
  setupHero();
  setupSearch();
  setupPlayers();
});
