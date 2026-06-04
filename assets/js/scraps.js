/* =============================================================
 * FinEdu — 즐겨찾기 (/scraps.html)
 * ============================================================= */

import { api } from "./api.js";

const $ = (sel, el = document) => el.querySelector(sel);

const state = {
  lessons: [],
  terms: [],
  termsCatalog: null,  // terms.json 의 term → entry 맵, lazy load
  tab: "lessons",
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

function relDate(iso) {
  if (!iso) return "";
  const t = new Date(iso.replace(" ", "T")).getTime();
  const d = (Date.now() - t) / 1000;
  if (d < 60) return "방금 전";
  if (d < 3600) return `${Math.floor(d / 60)}분 전`;
  if (d < 86400) return `${Math.floor(d / 3600)}시간 전`;
  if (d < 86400 * 7) return `${Math.floor(d / 86400)}일 전`;
  return iso.slice(0, 10);
}

async function loadTermsCatalog() {
  if (state.termsCatalog) return state.termsCatalog;
  try {
    const res = await fetch("/assets/data/terms.json", { cache: "force-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const arr = await res.json();
    const map = new Map();
    for (const t of arr) map.set(t.term, t);
    state.termsCatalog = map;
    return map;
  } catch (_) {
    state.termsCatalog = new Map();
    return state.termsCatalog;
  }
}

function renderTabs() {
  document.querySelectorAll(".scraps-tab").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.tab === state.tab);
  });
  $("#count-lessons").textContent = state.lessons.length;
  $("#count-terms").textContent   = state.terms.length;
}

async function renderList() {
  const host = $("#scraps-list");
  if (state.tab === "lessons") {
    if (state.lessons.length === 0) {
      host.innerHTML = `<div class="scraps-empty">
        <h3>아직 저장한 학습이 없어요</h3>
        <p>레슨 풀다가 즐겨찾기 버튼을 누르면 여기에 모여요.</p>
        <a class="btn btn--sm" href="/learn.html">학습 보러 가기</a>
      </div>`;
      return;
    }
    host.innerHTML = state.lessons.map((l) => `
      <article class="scrap-card" data-type="lesson" data-key="${l.id}">
        <div class="scrap-card__head">
          <span class="scrap-card__unit">${esc(l.unit_title)}</span>
          <button class="scrap-card__remove" type="button" aria-label="해제"
                  data-type="lesson" data-key="${l.id}">✕</button>
        </div>
        <h3 class="scrap-card__title">
          <a href="/lesson.html?slug=${esc(l.unit_slug)}/${esc(l.slug)}">${esc(l.title)}</a>
        </h3>
        ${l.summary ? `<p class="scrap-card__summary">${esc(l.summary)}</p>` : ""}
        <div class="scrap-card__foot">
          <span class="scrap-card__time">${relDate(l.scraped_at)}</span>
          <a class="btn btn--sm" href="/lesson.html?slug=${esc(l.unit_slug)}/${esc(l.slug)}">다시 풀기</a>
        </div>
      </article>
    `).join("");
    bindRemoveButtons();
    return;
  }

  // terms
  if (state.terms.length === 0) {
    host.innerHTML = `<div class="scraps-empty">
      <h3>아직 저장한 용어가 없어요</h3>
      <p>용어사전에서 즐겨찾기 버튼을 누르면 여기에 모여요.</p>
      <a class="btn btn--sm" href="/terms.html">용어사전 가기</a>
    </div>`;
    return;
  }
  const catalog = await loadTermsCatalog();
  host.innerHTML = state.terms.map((s) => {
    const meta = catalog.get(s.term_slug);
    if (!meta) {
      return `<article class="scrap-card scrap-card--missing" data-type="term" data-key="${esc(s.term_slug)}">
        <div class="scrap-card__head">
          <span class="scrap-card__unit">용어</span>
          <button class="scrap-card__remove" type="button" data-type="term" data-key="${esc(s.term_slug)}">✕</button>
        </div>
        <h3 class="scrap-card__title">${esc(s.term_slug)}</h3>
        <p class="scrap-card__summary">사전에서 더 이상 찾을 수 없는 용어예요.</p>
        <div class="scrap-card__foot"><span class="scrap-card__time">${relDate(s.scraped_at)}</span></div>
      </article>`;
    }
    const catLabel = ({
      stock:"경제", market:"시장", basic:"기초", macro:"거시", asset:"금융", tax:"세금·연금"
    })[meta.category] ?? meta.category;
    return `
      <article class="scrap-card" data-type="term" data-key="${esc(s.term_slug)}">
        <div class="scrap-card__head">
          <span class="scrap-card__unit">${esc(catLabel)}</span>
          <button class="scrap-card__remove" type="button" data-type="term" data-key="${esc(s.term_slug)}">✕</button>
        </div>
        <h3 class="scrap-card__title">${esc(meta.term)} <span class="scrap-card__title-en">${esc(meta.term_en || "")}</span></h3>
        <p class="scrap-card__summary">${esc(meta.definition)}</p>
        <div class="scrap-card__foot">
          <span class="scrap-card__time">${relDate(s.scraped_at)}</span>
          <a class="btn btn--secondary btn--sm" href="/terms.html">사전 보기</a>
        </div>
      </article>
    `;
  }).join("");
  bindRemoveButtons();
}

function bindRemoveButtons() {
  document.querySelectorAll(".scrap-card__remove").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const type = btn.dataset.type;
      const key  = btn.dataset.key;
      btn.disabled = true;
      const res = await api.post("/scraps/toggle.php", { target_type: type, target_key: key });
      if (!res.ok) {
        if (window.toast) window.toast(res.error || "삭제 실패", { variant: "danger" });
        btn.disabled = false;
        return;
      }
      // 로컬 상태 갱신
      if (type === "lesson") {
        state.lessons = state.lessons.filter((l) => String(l.id) !== String(key));
      } else {
        state.terms = state.terms.filter((t) => t.term_slug !== key);
      }
      renderTabs();
      renderList();
      if (window.toast) window.toast("즐겨찾기에서 빼냈어요.");
    });
  });
}

async function load() {
  const me = await api.get("/auth/me.php");
  if (!me.ok || !me.data?.user) {
    window.location.replace("/login.html");
    return;
  }
  const res = await api.get("/scraps/list.php");
  if (!res.ok) {
    if (window.toast) window.toast(res.error || "불러오기 실패", { variant: "danger" });
    return;
  }
  state.lessons = res.data.lessons || [];
  state.terms   = res.data.terms   || [];
  renderTabs();
  renderList();
}

document.querySelectorAll(".scraps-tab").forEach((b) => {
  b.addEventListener("click", () => {
    state.tab = b.dataset.tab;
    renderTabs();
    renderList();
  });
});

load();
