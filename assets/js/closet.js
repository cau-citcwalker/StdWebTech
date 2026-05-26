/* =============================================================
 * FinEdu — 옷장 (`/closet`)
 *
 * - state.php 로 아이템 + 보유 + 장착 정보 불러오기
 * - 슬롯 탭으로 카테고리 전환 (hat / glasses / scarf / background)
 * - 아이템 클릭 → equip.php 호출 → 마스코트 실시간 업데이트
 * - 미보유 아이템은 잠금 표시 (마켓 안내)
 * ============================================================= */

import { api } from "./api.js";
import { sfx } from "./sfx.js";
import { buildMascotSvg, renderMascotInto } from "./mascot.js";

const SLOTS = [
  { key: "hair",      label: "머리" },
  { key: "face",      label: "표정" },
  { key: "top",       label: "상의" },
  { key: "bottom",    label: "하의" },
  { key: "shoes",     label: "신발" },
  { key: "accessory", label: "엑세서리" },
];

const state = {
  items: [],
  itemsBySlot: {},
  owned: new Set(),
  equipped: {},
  coins: 0,
  activeSlot: "hat",
  user: null,
};

const $ = (s, el = document) => el.querySelector(s);
const stageEl = $("#closet-mascot");
const coinsEl = $("#closet-coins");
const tabsEl = $("#closet-tabs");
const gridEl = $("#closet-grid");
const nameEl = $("#closet-name");

function refreshMascot() {
  renderMascotInto(stageEl, { equipped: state.equipped, items: state.items, size: 320 });
}

function renderTabs() {
  tabsEl.innerHTML = SLOTS.map((s) => `
    <button class="closet-tab ${s.key === state.activeSlot ? "is-active" : ""}"
            type="button" data-slot="${s.key}">${s.label}</button>
  `).join("");
  tabsEl.querySelectorAll(".closet-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeSlot = btn.dataset.slot;
      renderTabs();
      renderGrid();
      sfx.tap();
    });
  });
}

function previewSvgFor(item) {
  // 미니 미리보기: base 마스코트 + 이 아이템만 (현재 장착 무시)
  return buildMascotSvg({
    equipped: { [item.slot]: item.id },
    items: state.items,
    size: 160,
  });
}

function renderGrid() {
  const slot = state.activeSlot;
  const items = (state.itemsBySlot[slot] || []);

  // 슬롯 비우기 옵션
  const noneEquipped = !state.equipped[slot];
  const noneCard = `
    <div class="item-card item-card--none ${noneEquipped ? "is-equipped" : ""}"
         data-action="unequip" data-slot="${slot}">
      <div class="item-card__preview">
        ${noneEquipped ? '<span class="item-card__badge">착용중</span>' : ""}
      </div>
      <div class="item-card__name">비우기</div>
      <div class="item-card__meta">아무것도 안 입기</div>
    </div>
  `;

  const cards = items.map((it) => {
    const owned    = state.owned.has(it.id);
    const equipped = state.equipped[slot] === it.id;
    const klass = ["item-card"];
    if (equipped) klass.push("is-equipped");
    if (!owned) klass.push("is-locked");

    return `
      <div class="${klass.join(" ")}"
           data-action="equip" data-id="${it.id}">
        <div class="item-card__preview">
          ${equipped ? '<span class="item-card__badge">착용중</span>' : ""}
          ${!owned ? '<span class="item-card__badge">잠김</span>' : ""}
          ${previewSvgFor(it)}
        </div>
        <div class="item-card__name">${it.name}</div>
        <div class="item-card__meta">
          <span class="item-card__rarity item-card__rarity--${it.rarity}">${rarityLabel(it.rarity)}</span>
          ${owned
            ? "<span>보유중</span>"
            : `<span class="item-card__price">
                 <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="#ffd14d"/><text x="12" y="16" font-size="11" font-weight="800" text-anchor="middle" fill="#7a5300">₩</text></svg>
                 ${it.price.toLocaleString("ko-KR")}
               </span>`}
        </div>
      </div>
    `;
  }).join("");

  gridEl.innerHTML = noneCard + cards;

  gridEl.querySelectorAll(".item-card").forEach((el) => {
    el.addEventListener("click", () => handleCardClick(el));
  });
}

function rarityLabel(r) {
  return ({ starter: "스타터", common: "보통", rare: "레어", epic: "에픽" })[r] ?? r;
}

async function handleCardClick(el) {
  if (el.classList.contains("is-locked")) {
    if (window.toast) window.toast("아직 가지고 있지 않은 아이템이에요. 마켓에서 살 수 있어요.", { variant: "danger" });
    return;
  }
  const slot = state.activeSlot;
  if (el.dataset.action === "unequip") {
    await doEquip(slot, null);
  } else {
    const id = Number(el.dataset.id);
    if (state.equipped[slot] === id) {
      // 이미 장착 — 다시 누르면 해제
      await doEquip(slot, null);
    } else {
      await doEquip(slot, id);
    }
  }
}

async function doEquip(slot, itemId) {
  const res = await api.post("/character/equip.php", { slot, item_id: itemId });
  if (!res.ok) {
    if (window.toast) window.toast(res.error || "변경 실패", { variant: "danger" });
    return;
  }
  state.equipped = res.data.equipped || {};
  refreshMascot();
  renderGrid();
  sfx.correct();
}

async function init() {
  const me = await api.get("/auth/me.php");
  if (!me.ok || !me.data?.user) {
    window.location.replace("/login.html");
    return;
  }

  const res = await api.get("/character/state.php");
  if (!res.ok) {
    if (window.toast) window.toast(res.error || "옷장을 불러오지 못했어요.", { variant: "danger" });
    return;
  }

  state.items    = res.data.items;
  state.itemsBySlot = state.items.reduce((acc, it) => {
    (acc[it.slot] ||= []).push(it);
    return acc;
  }, {});
  state.owned    = new Set(res.data.owned || []);
  state.equipped = res.data.equipped || {};
  state.coins    = res.data.coins ?? 0;
  state.user     = res.data.user;

  if (nameEl)  nameEl.textContent = state.user?.display_name ?? "도토리";
  if (coinsEl) coinsEl.textContent = state.coins.toLocaleString("ko-KR");

  renderTabs();
  renderGrid();
  refreshMascot();
}

init();
