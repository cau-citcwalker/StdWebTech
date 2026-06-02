/* =============================================================
 * FinEdu — 경제용어사전 (`/terms.html`)
 *
 *   - assets/data/terms.json 에서 용어 목록 fetch
 *   - 카테고리 탭으로 필터, 검색창으로 substring 매칭
 *   - 결과는 카드 그리드로 렌더 + 카운트 표시
 * ============================================================= */

const CATEGORIES = [
  { key: "all",    label: "전체" },
  { key: "stock",  label: "주식" },
  { key: "market", label: "시장" },
  { key: "basic",  label: "기초" },
  { key: "macro",  label: "거시" },
  { key: "asset",  label: "자산" },
  { key: "tax",    label: "세금·연금" },
];

const $ = (sel, el = document) => el.querySelector(sel);

const state = {
  terms: [],
  category: "all",
  query: "",
};

const tabsEl  = $("#terms-tabs");
const gridEl  = $("#terms-grid");
const countEl = $("#terms-count");
const searchEl = $("#terms-search");

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
    <article class="term-card">
      <header class="term-card__head">
        <h2 class="term-card__name">${esc(t.term)}<span class="term-card__name-en">${esc(t.term_en || "")}</span></h2>
        <span class="term-card__badge ${badgeClass}">${esc(categoryLabel(t.category))}</span>
      </header>
      <p class="term-card__def">${esc(t.definition)}</p>
      ${t.example ? `<p class="term-card__example">${esc(t.example)}</p>` : ""}
    </article>
  `;
}

function renderGrid() {
  const q = state.query.trim().toLowerCase();
  const filtered = state.terms.filter((t) =>
    (state.category === "all" || t.category === state.category)
    && termMatchesQuery(t, q)
  );

  countEl.textContent = `${filtered.length}개의 용어`;

  if (filtered.length === 0) {
    gridEl.innerHTML = `
      <div class="terms-empty">
        <h3>${q ? "검색 결과가 없어요" : "아직 등록된 용어가 없어요"}</h3>
        <p>${q ? `"${esc(q)}" 에 해당하는 용어를 찾지 못했어요.` : "곧 더 많은 용어가 추가될 거예요."}</p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = filtered.map(termCard).join("");
}

async function init() {
  try {
    const res = await fetch("/assets/data/terms.json", { cache: "force-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    state.terms = await res.json();
  } catch (e) {
    countEl.textContent = "용어 데이터를 불러오지 못했어요.";
    gridEl.innerHTML = "";
    return;
  }
  // 가나다 → 사전 순으로 정렬
  state.terms.sort((a, b) => a.term.localeCompare(b.term, "ko"));

  renderTabs();
  renderGrid();

  searchEl.addEventListener("input", (e) => {
    state.query = e.target.value;
    renderGrid();
  });
}

init();
