/* =============================================================
 * FinEdu — 리그 (`/league`)
 * ============================================================= */

import { api } from "./api.js";
import { sfx } from "./sfx.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const state = {
  data: null,
  tab: "weekly", // 'weekly' | 'hall'
  myId: null,
};

function tierEmoji(key) {
  return ({ bronze: "🥉", silver: "🥈", gold: "🥇", sapphire: "💎", ruby: "♦️", diamond: "👑" })[key] ?? "🏅";
}

function renderMe(me) {
  state.myId = me.user.id;
  const tier = me.tier;
  $("#my-card").style.setProperty("--tier-color", tier.color);
  $("#my-crest").textContent = tierEmoji(tier.key);
  $("#my-tier-name").textContent = tier.name;
  $("#my-rank").textContent = me.weekly_rank ? `이번 주 ${me.weekly_rank}위` : "이번 주 미참여";
  $("#my-weekly-xp").textContent = me.weekly_xp.toLocaleString("ko-KR");
  $("#my-total-xp").textContent  = me.total_xp.toLocaleString("ko-KR");
  $("#my-total-rank").textContent = me.total_rank ? `전체 ${me.total_rank}위` : "—";

  // 다음 티어
  const next = me.next_tier;
  const nextBox = $("#next-tier");
  if (!next) {
    nextBox.innerHTML = `<div class="next-tier__row"><span>최고 티어!</span><span>👑</span></div>`;
    return;
  }
  const prevMin = me.tier.min;
  const span = Math.max(1, next.min - prevMin);
  const got  = Math.max(0, me.total_xp - prevMin);
  const pct = Math.min(100, Math.round((got / span) * 100));
  nextBox.innerHTML = `
    <div class="next-tier__row">
      <span>다음: ${tierEmoji(next.key)} ${next.name}</span>
      <span>${next.to_go.toLocaleString("ko-KR")} XP 남음</span>
    </div>
    <div class="progress" aria-hidden="true">
      <div class="progress__bar" style="width: ${pct}%;"></div>
    </div>
  `;
}

function renderTabs() {
  $$(".league-tab").forEach((b) => {
    const active = b.dataset.tab === state.tab;
    b.classList.toggle("is-active", active);
  });
}

function rowHtml(row, idx) {
  const isMe = row.user_id === state.myId;
  return `
    <div class="lb-row ${isMe ? "is-me" : ""}">
      <div class="lb-rank">${idx + 1}</div>
      <div class="lb-info">
        <div class="lb-info__name">${row.display_name}${isMe ? " (나)" : ""}</div>
        <div class="lb-info__handle">@${row.username}</div>
      </div>
      <span class="lb-tier" style="background: ${row.tier.color};">${tierEmoji(row.tier.key)} ${row.tier.name}</span>
      <div class="lb-xp">
        ${(row.weekly_xp ?? row.total_xp).toLocaleString("ko-KR")}<small>XP</small>
      </div>
    </div>
  `;
}

function renderList() {
  const list = state.tab === "weekly" ? state.data.weekly : state.data.hall_of_fame;
  const host = $("#lb-list");
  if (!list || list.length === 0) {
    host.innerHTML = `
      <div class="lb-empty">
        <img src="assets/img/character-base.png" alt=""/>
        <h3>${state.tab === "weekly" ? "이번 주 활동 기록이 아직 없어요" : "명예의 전당이 비어있어요"}</h3>
        <p>${state.tab === "weekly" ? "레슨을 풀면 순위에 올라가요." : "첫 학습자가 되어보세요!"}</p>
      </div>`;
    return;
  }
  host.innerHTML = list.map(rowHtml).join("");
}

function bindTabs() {
  $$(".league-tab").forEach((b) => {
    b.addEventListener("click", () => {
      state.tab = b.dataset.tab;
      renderTabs();
      renderList();
      sfx.tap();
    });
  });
}

async function init() {
  const me = await api.get("/auth/me.php");
  if (!me.ok || !me.data?.user) {
    window.location.replace("/login.html");
    return;
  }
  const res = await api.get("/league/leaderboard.php");
  if (!res.ok) {
    if (window.toast) window.toast(res.error || "리그를 불러오지 못했어요.", { variant: "danger" });
    return;
  }
  state.data = res.data;
  renderMe(res.data.me);
  bindTabs();
  renderTabs();
  renderList();
}

init();
