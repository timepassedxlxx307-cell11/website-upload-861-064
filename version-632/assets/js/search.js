import { movies } from "./search-index.js";

const form = document.getElementById("search-page-form");
const input = document.getElementById("search-input");
const results = document.getElementById("search-results");
const heading = document.getElementById("search-heading");
const count = document.getElementById("search-count");

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";

const escapeHtml = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const card = (movie) => {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
          <a class="movie-card movie-card--compact" href="${escapeHtml(movie.url)}">
            <span class="poster-frame">
              <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
              <span class="poster-shade"></span>
              <span class="play-chip">播放</span>
            </span>
            <span class="movie-card__body">
              <strong>${escapeHtml(movie.title)}</strong>
              <span class="movie-card__line">${escapeHtml(movie.oneLine)}</span>
              <span class="movie-card__meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</span>
              <span class="movie-card__tags">${tags}</span>
            </span>
          </a>`;
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const render = (query) => {
    const keyword = normalize(query);
    if (!results || !heading || !count) {
        return;
    }
    if (!keyword) {
        const top = movies.slice(0, 24);
        heading.textContent = "热门推荐";
        count.textContent = "输入关键词可查看匹配结果。";
        results.innerHTML = top.map(card).join("");
        return;
    }
    const matched = movies.filter((movie) => normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags.join(" "),
        movie.oneLine
    ].join(" ")).includes(keyword));
    heading.textContent = `“${query}”的搜索结果`;
    count.textContent = `找到 ${matched.length} 部相关影片`;
    results.innerHTML = matched.slice(0, 120).map(card).join("") || `<p class="empty-result">没有找到相关影片。</p>`;
};

if (input) {
    input.value = initialQuery;
    input.addEventListener("input", () => render(input.value));
}

if (form) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = input ? input.value : "";
        const url = query.trim() ? `./search.html?q=${encodeURIComponent(query.trim())}` : "./search.html";
        history.replaceState(null, "", url);
        render(query);
    });
}

render(initialQuery);
