/* =============================================================
 * FinEdu — 마켓 (`/market`)
 *
 * - /api/character/state.php 로 catalog + owned + equipped + coins
 * - 슬롯 탭으로 필터
 * - 카드의 “구매” → 컨펌 모달 → /api/market/buy.php
 * ============================================================= */

import { api } from "./api.js";
import { sfx } from "./sfx.js";
import { buildMascotSvg } from "./mascot.js";

const SLOTS = [
  { key: "all",    label: "전체" },
  { key: "outfit", label: "옷차림" },
];

const state = {
  items: [],
  owned: new Set(),
  coins: 0,
  filter: "all",
  user: null,
};

const $ = (s, el = document) => el.querySelector(s);
const tabsEl = $("#market-tabs");
const gridEl = $("#market-grid");
const coinsEl = $("#market-coins");

function renderTabs() {
  tabsEl.innerHTML = SLOTS.map((s) => `
    <button class="market-tab ${s.key === state.filter ? "is-active" : ""}"
            type="button" data-slot="${s.key}">${s.label}</button>
  `).join("");
  tabsEl.querySelectorAll(".market-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.slot;
      renderTabs();
      renderGrid();
      sfx.tap();
    });
  });
}

function previewFor(item) {
  return buildMascotSvg({
    equipped: { [item.slot]: item.id },
    items: state.items,
    size: 200,
  });
}

function renderGrid() {
  const all = state.items.filter((it) => state.filter === "all" || it.slot === state.filter);
  if (all.length === 0) {
    gridEl.innerHTML = `<p style="color: var(--color-text-soft);">이 카테고리는 비어있어요.</p>`;
    return;
  }
  gridEl.innerHTML = all.map((it) => {
    const owned = state.owned.has(it.id);
    const isFree = it.price === 0;
    const ctaLabel = owned ? "보유중" : (isFree ? "획득" : `${it.price.toLocaleString("ko-KR")} 코인 구매`);
    const ctaClass = owned ? "btn btn--secondary market-card__cta"
                  : (isFree ? "btn btn--blue market-card__cta" : "btn market-card__cta");
    return `
      <article class="market-card ${owned ? "is-owned" : ""}" data-id="${it.id}">
        <div class="market-card__preview">
          <span class="market-card__rarity market-card__rarity--${it.rarity}">${rarityLabel(it.rarity)}</span>
          ${previewFor(it)}
        </div>
        <h3 class="market-card__title">${it.name}</h3>
        <p class="market-card__desc">${it.description ?? ""}</p>
        ${isFree ? "" : `
          <div class="market-card__price">
            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="#ffd14d"/><text x="12" y="16" font-size="11" font-weight="800" text-anchor="middle" fill="#7a5300">₩</text></svg>
            ${it.price.toLocaleString("ko-KR")}
          </div>`}
        <button class="${ctaClass}" type="button" ${owned ? "disabled" : ""}>${ctaLabel}</button>
      </article>
    `;
  }).join("");

  gridEl.querySelectorAll(".market-card").forEach((card) => {
    const id = Number(card.dataset.id);
    const item = state.items.find((x) => x.id === id);
    if (!item || state.owned.has(id)) return;
    card.querySelector("button").addEventListener("click", () => openBuyModal(item));
  });
}

function rarityLabel(r) {
  return ({ starter: "스타터", common: "보통", rare: "레어", epic: "에픽" })[r] ?? r;
}

function setCoins(n) {
  state.coins = n;
  if (coinsEl) coinsEl.textContent = n.toLocaleString("ko-KR");
}

/* -------------------------------------------------------------
 * 컨펌 모달
 * ------------------------------------------------------------- */
function openBuyModal(item) {
  const host = document.createElement("div");
  host.className = "modal-host";
  host.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <h2 class="modal__title">${item.name}</h2>
      <p class="modal__sub">
        ${item.price === 0
          ? "무료 아이템을 받을게요."
          : `${item.price.toLocaleString("ko-KR")} 코인을 사용해서 이 아이템을 구매할게요.`}
        <br><small>현재 코인: ${state.coins.toLocaleString("ko-KR")}</small>
      </p>
      <div class="modal__preview">${previewFor(item)}</div>
      <div class="modal__actions">
        <button class="btn btn--secondary" type="button" data-action="cancel">취소</button>
        <button class="btn" type="button" data-action="confirm">${item.price === 0 ? "받기" : "구매"}</button>
      </div>
    </div>
  `;
  document.body.appendChild(host);

  const close = () => host.remove();

  host.querySelector("[data-action=cancel]").addEventListener("click", () => { close(); sfx.tap(); });
  host.addEventListener("click", (e) => { if (e.target === host) close(); });
  host.querySelector("[data-action=confirm]").addEventListener("click", async () => {
    const btn = host.querySelector("[data-action=confirm]");
    btn.disabled = true;
    btn.textContent = "처리 중…";
    const res = await api.post("/market/buy.php", { item_id: item.id });
    if (!res.ok) {
      if (window.toast) window.toast(res.error || "구매 실패", { variant: "danger" });
      sfx.wrong();
      btn.disabled = false;
      btn.textContent = item.price === 0 ? "받기" : "구매";
      return;
    }
    state.owned = new Set(res.data.owned);
    setCoins(res.data.coins);
    renderGrid();
    close();
    sfx.correct();
    if (window.toast) window.toast(`${item.name} 획득!`, { variant: "success" });
  });
}

/* -------------------------------------------------------------
 * 초기화
 * ------------------------------------------------------------- */
async function init() {
  const me = await api.get("/auth/me.php");
  if (!me.ok || !me.data?.user) {
    window.location.replace("/login.html");
    return;
  }
  const res = await api.get("/character/state.php");
  if (!res.ok) {
    if (window.toast) window.toast(res.error || "마켓을 불러오지 못했어요.", { variant: "danger" });
    return;
  }
  state.items = res.data.items;
  state.owned = new Set(res.data.owned);
  setCoins(res.data.coins ?? 0);
  state.user  = res.data.user;

  renderTabs();
  renderGrid();
}

init();
