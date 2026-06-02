/* =============================================================
 * FinEdu — 경제용어사전 (`/terms.html`)
 *
 *   - assets/data/terms.json 에서 용어 목록 fetch
 *   - 카테고리 탭으로 필터, 검색창으로 substring 매칭
 *   - 결과는 5개씩 페이지네이션 (한 페이지에 너무 많은 행 쌓이지 않게)
 * ============================================================= */

const CATEGORIES = [
  { key: "all",    label: "전체" },
  { key: "stock",  label: "경제" },
  { key: "market", label: "시장" },
  { key: "basic",  label: "기초" },
  { key: "macro",  label: "거시" },
  { key: "asset",  label: "금융" },
  { key: "tax",    label: "세금·연금" },
];

const PAGE_SIZE = 5;

const $ = (sel, el = document) => el.querySelector(sel);

const state = {
  terms: [],
  category: "all",
  query: "",
  page: 1,
};

const tabsEl   = $("#terms-tabs");
const gridEl   = $("#terms-grid");
const countEl  = $("#terms-count");
const searchEl = $("#terms-search");
const pagerEl  = $("#terms-pagination");

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  }[c]));
}

function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

function renderTabs() {
  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.key] = c.key === "all"
      ? state.terms.length
      : state.terms.filter((t) => t.category === c.key).length;
    return acc;
  }, {});
  tabsEl.innerHTML = CATEGORIES.map((c) => `
    <button class="terms-tab ${c.key === state.category ? "is-active" : ""}"
            type="button" data-cat="${c.key}" role="tab">
      ${c.label}<span class="terms-tab__count">${counts[c.key]}</span>
    </button>
  `).join("");
  tabsEl.querySelectorAll(".terms-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.cat;
      state.page = 1;
      renderTabs();
      renderGrid();
    });
  });
}

function termMatchesQuery(t, q) {
  if (!q) return true;
  const hay = `${t.term} ${t.term_en} ${t.definition} ${t.example ?? ""}`.toLowerCase();
  return hay.includes(q);
}

function termCard(t) {
  const badgeClass = `term-card__badge--${t.category}`;
  return `
    <article class="term-card" data-cat="${esc(t.category)}">
      <header class="term-card__head">
        <h2 class="term-card__name">${esc(t.term)}<span class="term-card__name-en">${esc(t.term_en || "")}</span></h2>
        <span class="term-card__badge ${badgeClass}">${esc(categoryLabel(t.category))}</span>
      </header>
      <p class="term-card__def">${esc(t.definition)}</p>
      ${t.example ? `<p class="term-card__example">${esc(t.example)}</p>` : ""}
    </article>
  `;
}

function paginationButtons(current, total) {
  if (total <= 1) return "";
  const btn = (label, page, { disabled = false, active = false, aria = "" } = {}) => `
    <button class="terms-page ${active ? "is-active" : ""}"
            type="button" data-page="${page}"
            ${disabled ? "disabled" : ""} ${aria ? `aria-label="${aria}"` : ""}>${label}</button>
  `;

  // 페이지가 7개 이하면 전부 노출, 그 이상이면 양 끝 + 현재 주변만 노출
  const pages = [];
  if (total <= 7) {
    for (let p = 1; p <= total; p++) pages.push(p);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
    if (current < total - 2) pages.push("…");
    pages.push(total);
  }

  return `
    <nav class="terms-pagination" aria-label="페이지">
      ${btn("‹", current - 1, { disabled: current === 1, aria: "이전 페이지" })}
      ${pages.map((p) =>
        typeof p === "number"
          ? btn(String(p), p, { active: p === current })
          : `<span class="terms-page terms-page--ellipsis">${p}</span>`
      ).join("")}
      ${btn("›", current + 1, { disabled: current === total, aria: "다음 페이지" })}
    </nav>
  `;
}

function renderGrid() {
  const q = state.query.trim().toLowerCase();
  const filtered = state.terms.filter((t) =>
    (state.category === "all" || t.category === state.category)
    && termMatchesQuery(t, q)
  );

  if (filtered.length === 0) {
    countEl.textContent = "0개의 용어";
    gridEl.innerHTML = `
      <div class="terms-empty">
        <h3>${q ? "검색 결과가 없어요" : "아직 등록된 용어가 없어요"}</h3>
        <p>${q ? `"${esc(q)}" 에 해당하는 용어를 찾지 못했어요.` : "곧 더 많은 용어가 추가될 거예요."}</p>
      </div>
    `;
    pagerEl.innerHTML = "";
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (state.page > totalPages) state.page = totalPages;
  if (state.page < 1)          state.page = 1;

  const start = (state.page - 1) * PAGE_SIZE;
  const end   = Math.min(start + PAGE_SIZE, filtered.length);
  const slice = filtered.slice(start, end);

  countEl.textContent = `${filtered.length}개 중 ${start + 1}–${end}`;
  gridEl.innerHTML = slice.map(termCard).join("");

  pagerEl.innerHTML = paginationButtons(state.page, totalPages);
  pagerEl.querySelectorAll(".terms-page:not(.terms-page--ellipsis)").forEach((btn) => {
    if (btn.disabled) return;
    btn.addEventListener("click", () => {
      const p = Number(btn.dataset.page);
      if (!p || p === state.page) return;
      state.page = p;
      renderGrid();
      // 페이지 이동 시 리스트 상단으로 살짝 스크롤
      gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

async function init() {
  try {
    const res = await fetch("/assets/data/terms.json", { cache: "force-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    state.terms = await res.json();
  } catch (e) {
    countEl.textContent = "용어 데이터를 불러오지 못했어요.";
    gridEl.innerHTML = "";
    pagerEl.innerHTML = "";
    return;
  }
  // 가나다 → 사전 순으로 정렬
  state.terms.sort((a, b) => a.term.localeCompare(b.term, "ko"));

  renderTabs();
  renderGrid();

  searchEl.addEventListener("input", (e) => {
    state.query = e.target.value;
    state.page = 1;
    renderGrid();
  });
}

init();
