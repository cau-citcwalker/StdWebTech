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
  { key: "hair",   label: "헤어" },
  { key: "top",    label: "상의" },
  { key: "bottom", label: "하의" },
];

const state = {
  items: [],
  itemsBySlot: {},
  owned: new Set(),
  equipped: {},
  coins: 0,
  activeSlot: "hair",
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
  // 미니 미리보기: 현재 장착 상태와 무관하게 "이 아이템만 입은" 모습으로 단독 렌더.
  // (54-PNG 풀세트라 single 슬롯도 정확한 PNG 가 존재 — hair2.png · top1.png 등)
  return buildMascotSvg({
    equipped: { [item.slot]: item.id },
    items: state.items,
    size: 160,
  });
}

function renderGrid() {
  const slot = state.activeSlot;
  const items = (state.itemsBySlot[slot] || []);

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
      </div>
    `;
  }).join("");

  gridEl.innerHTML = cards;

  gridEl.querySelectorAll(".item-card").forEach((el) => {
    el.addEventListener("click", () => handleCardClick(el));
  });
}

async function handleCardClick(el) {
  if (el.classList.contains("is-locked")) {
    if (window.toast) window.toast("아직 가지고 있지 않은 아이템이에요. 마켓에서 살 수 있어요.", { variant: "danger" });
    return;
  }
  const slot = state.activeSlot;
  const id = Number(el.dataset.id);
  if (state.equipped[slot] === id) return; // 이미 장착중이면 무시
  await doEquip(slot, id);
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

async function resetEquipment() {
  // 세 슬롯을 순차 해제 (equip.php 는 item_id=null 이면 DELETE FROM user_equipment).
  // 빈 슬롯도 그냥 한 번씩 호출 — 멱등.
  const btn = document.getElementById("closet-reset");
  if (btn) btn.disabled = true;
  let last;
  for (const s of SLOTS) {
    last = await api.post("/character/equip.php", { slot: s.key, item_id: null });
    if (!last.ok) {
      if (window.toast) window.toast(last.error || "초기화 실패", { variant: "danger" });
      if (btn) btn.disabled = false;
      return;
    }
  }
  state.equipped = last.data.equipped || {};
  refreshMascot();
  renderGrid();
  sfx.correct();
  if (window.toast) window.toast("기본 캐릭터로 돌아갔어요.");
  if (btn) btn.disabled = false;
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

  if (nameEl)  nameEl.textContent = state.user?.display_name ?? "내 캐릭터";
  if (coinsEl) coinsEl.textContent = state.coins.toLocaleString("ko-KR");

  renderTabs();
  renderGrid();
  refreshMascot();

  document.getElementById("closet-reset")?.addEventListener("click", resetEquipment);
}

init();
