/* =============================================================
 * FinEdu — 친구 목록 (`/friends`)
 * ============================================================= */

import { api } from "./api.js";
import { sfx } from "./sfx.js";

const TABS = [
  { key: "friends",  label: "내 친구" },
  { key: "incoming", label: "받은 신청" },
  { key: "outgoing", label: "보낸 신청" },
];

const state = {
  data: { friends: [], incoming: [], outgoing: [] },
  tab: "friends",
};

const $ = (s, el = document) => el.querySelector(s);
const tabsEl = $("#friends-tabs");
const listEl = $("#friends-list");

async function load() {
  const res = await api.get("/friends/list.php");
  if (!res.ok) {
    if (window.toast) window.toast(res.error || "친구 목록을 불러오지 못했어요.", { variant: "danger" });
    return;
  }
  state.data = res.data;
  renderTabs();
  renderList();
}

function renderTabs() {
  const counts = {
    friends:  state.data.friends.length,
    incoming: state.data.incoming.length,
    outgoing: state.data.outgoing.length,
  };
  tabsEl.innerHTML = TABS.map((t) => `
    <button class="friends-tab ${t.key === state.tab ? "is-active" : ""}"
            type="button" data-tab="${t.key}">
      ${t.label}<span class="friends-tab__count">${counts[t.key]}</span>
    </button>
  `).join("");
  tabsEl.querySelectorAll(".friends-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.tab = btn.dataset.tab;
      renderTabs();
      renderList();
      sfx.tap();
    });
  });
}

function avatarFor(user) {
  // list.php 가 친구별 outfit slug 를 같이 내려주므로 그 JPEG 를 바로 <img> 로 박는다.
  // 옷차림이 비어 있으면 기본 cream-tee 로 fallback.
  const slug = user?.outfit_slug || "outfit-cream-tee";
  return `<img src="/assets/img/items/outfit/${slug}.png" alt="">`;
}

function friendCard(user, actionsHtml, opts = {}) {
  return `
    <article class="friend-card">
      <a class="friend-card__avatar" href="/friend?id=${user.id}" aria-label="${user.display_name}의 프로필">
        ${avatarFor(user)}
      </a>
      <div class="friend-card__body">
        <div class="friend-card__name">${user.display_name}</div>
        <div class="friend-card__handle">@${user.username}</div>
        <div class="friend-card__stats">
          <span>${user.xp.toLocaleString("ko-KR")} XP</span>
          <span>· D-${user.streak_days}</span>
        </div>
      </div>
      <div class="friend-card__actions">${actionsHtml}</div>
    </article>
  `;
}

function renderList() {
  if (state.tab === "friends") {
    if (state.data.friends.length === 0) {
      listEl.innerHTML = `
        <div class="friends-empty">
          <img src="assets/img/character-base.png" alt=""/>
          <h3>아직 친구가 없어요</h3>
          <p>위 검색창에 친구의 아이디나 이메일을 입력해서 신청해 보세요.</p>
        </div>`;
      return;
    }
    listEl.innerHTML = `<div class="friends-grid">${
      state.data.friends.map((u) => friendCard(u, `
        <a class="btn btn--secondary btn--sm" href="/friend?id=${u.id}">방문</a>
        <button class="btn btn--ghost btn--sm" data-action="remove" data-id="${u.id}">친구 끊기</button>
      `)).join("")
    }</div>`;
  } else if (state.tab === "incoming") {
    if (state.data.incoming.length === 0) {
      listEl.innerHTML = `<div class="friends-empty"><p>받은 신청이 없어요.</p></div>`;
      return;
    }
    listEl.innerHTML = `<div class="friends-grid">${
      state.data.incoming.map((r) => friendCard(r.from, `
        <button class="btn btn--sm" data-action="accept" data-rid="${r.request_id}">수락</button>
        <button class="btn btn--ghost btn--sm" data-action="decline" data-rid="${r.request_id}">거절</button>
      `)).join("")
    }</div>`;
  } else {
    if (state.data.outgoing.length === 0) {
      listEl.innerHTML = `<div class="friends-empty"><p>아직 보낸 신청이 없어요.</p></div>`;
      return;
    }
    listEl.innerHTML = `<div class="friends-grid">${
      state.data.outgoing.map((r) => friendCard(r.to, `
        <span style="color: var(--color-text-muted); font-size: var(--fs-13);">기다리는 중…</span>
      `)).join("")
    }</div>`;
  }

  // 버튼 핸들러
  listEl.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => handleAction(btn));
  });
}

async function handleAction(btn) {
  const action = btn.dataset.action;
  btn.disabled = true;
  if (action === "accept") {
    const res = await api.post("/friends/accept.php", { request_id: Number(btn.dataset.rid) });
    if (!res.ok) toastFail(res); else { sfx.correct(); if (window.toast) window.toast("친구가 되었어요!", { variant: "success" }); await load(); }
  } else if (action === "decline") {
    const res = await api.post("/friends/decline.php", { request_id: Number(btn.dataset.rid) });
    if (!res.ok) toastFail(res); else { await load(); }
  } else if (action === "remove") {
    if (!confirm("정말 친구를 끊을까요?")) { btn.disabled = false; return; }
    const res = await api.post("/friends/remove.php", { friend_id: Number(btn.dataset.id) });
    if (!res.ok) toastFail(res); else { await load(); }
  }
}

function toastFail(res) {
  if (window.toast) window.toast(res.error || "요청 실패", { variant: "danger" });
  sfx.wrong();
}

/* 신청 폼 */
$("#friend-search-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = $("#friend-search-input");
  const id = (input.value || "").trim();
  if (!id) return;
  input.disabled = true;
  const res = await api.post("/friends/request.php", { identifier: id });
  input.disabled = false;
  if (!res.ok) { toastFail(res); return; }
  if (res.data?.accepted) {
    if (window.toast) window.toast("이미 들어와 있던 신청을 수락했어요!", { variant: "success" });
  } else {
    if (window.toast) window.toast("친구 신청을 보냈어요.", { variant: "success" });
  }
  input.value = "";
  sfx.correct();
  load();
});

async function init() {
  const me = await api.get("/auth/me.php");
  if (!me.ok || !me.data?.user) {
    window.location.replace("/login.html");
    return;
  }
  await load();
}

init();
