const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");

if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
        const open = mobileNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
}

document.addEventListener(
    "error",
    (event) => {
        const target = event.target;
        if (target instanceof HTMLImageElement) {
            target.classList.add("image-missing");
        }
    },
    true
);

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let activeIndex = 0;

    const showSlide = (index) => {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === activeIndex);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === activeIndex);
        });
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.heroDot || 0));
        });
    });

    window.setInterval(() => {
        showSlide(activeIndex + 1);
    }, 5200);
}

const filters = Array.from(document.querySelectorAll(".list-filter"));

filters.forEach((input) => {
    const list = document.querySelector(".searchable-list");
    if (!list) {
        return;
    }
    const items = Array.from(list.children);
    input.addEventListener("input", () => {
        const keyword = input.value.trim().toLowerCase();
        items.forEach((item) => {
            const text = [
                item.dataset.title,
                item.dataset.region,
                item.dataset.genre,
                item.dataset.year,
                item.dataset.type,
                item.textContent
            ].join(" ").toLowerCase();
            item.hidden = keyword.length > 0 && !text.includes(keyword);
        });
    });
});

const players = Array.from(document.querySelectorAll(".movie-player"));

players.forEach((player) => {
    const video = player.querySelector("video");
    const overlay = player.querySelector(".player-overlay");
    const playUrl = player.dataset.playUrl;
    let prepared = false;

    const prepare = async () => {
        if (!video || !playUrl || prepared) {
            return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playUrl;
            return;
        }
        try {
            const module = await import("./hls-player.js");
            const Hls = module.H;
            if (Hls && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(playUrl);
                hls.attachMedia(video);
                player.hlsInstance = hls;
                return;
            }
        } catch (error) {
            prepared = false;
        }
        video.src = playUrl;
    };

    const start = async () => {
        await prepare();
        player.classList.add("is-playing");
        if (video) {
            try {
                await video.play();
            } catch (error) {
                player.classList.remove("is-playing");
            }
        }
    };

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    if (video) {
        video.addEventListener("click", () => {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", () => {
            player.classList.add("is-playing");
        });
    }
});
