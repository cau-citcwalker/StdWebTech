/* =============================================================
 * FinEdu — 내 프로필 (`/profile`)
 * ============================================================= */

import { api } from "./api.js";
import { renderMascotInto } from "./mascot.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function relativeKo(iso) {
  if (!iso) return "";
  const ts = new Date(iso.replace(" ", "T")).getTime();
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return Math.floor(diff / 60) + "분 전";
  if (diff < 86400) return Math.floor(diff / 3600) + "시간 전";
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + "일 전";
  return iso.slice(0, 10);
}

function renderUser(user) {
  $("#aside-name").textContent = user.display_name;
  $("#aside-handle").textContent = "@" + user.username;
  $("#aside-joined").textContent = `${(user.joined_at ?? "").slice(0, 10)} 가입`;
}

function renderStats(user, counters) {
  $("#stat-xp").textContent     = user.xp.toLocaleString("ko-KR");
  $("#stat-coins").textContent  = user.coins.toLocaleString("ko-KR");
  $("#stat-streak").textContent = user.streak_days;
  $("#stat-done").textContent   = counters.done_lessons;
  $("#stat-done-total").textContent = "/ " + counters.total_lessons;
  $("#stat-friend").textContent = counters.friends;
  $("#stat-owned").textContent  = counters.owned_items;
}

function renderWeekly(weekly) {
  const max = Math.max(1, ...weekly.map((w) => w.xp));
  const todayStr = new Date().toISOString().slice(0, 10);
  const labels = ["일", "월", "화", "수", "목", "금", "토"];

  $("#weekly-chart").innerHTML = weekly.map((w) => {
    const day = new Date(w.date + "T00:00:00");
    const lbl = labels[day.getDay()];
    const pct = Math.max(2, (w.xp / max) * 100);
    const isToday = w.date === todayStr;
    return `
      <div class="weekly-chart__bar ${isToday ? "weekly-chart__bar--today" : ""}">
        <div style="flex:1; display:flex; align-items:flex-end; width:100%;">
          <div class="weekly-chart__bar-fill" style="height: ${pct}%;" data-xp="${w.xp}"></div>
        </div>
        <div class="weekly-chart__label">${lbl}</div>
      </div>
    `;
  }).join("");
}

function renderRecent(recent) {
  if (recent.length === 0) {
    $("#recent-list").innerHTML = `
      <div class="recent-empty">
        <p>아직 완료한 레슨이 없어요.</p>
        <p><a class="btn btn--sm" href="/learn.html" style="margin-top:8px;">학습 시작하기 →</a></p>
      </div>`;
    return;
  }
  $("#recent-list").innerHTML = recent.map((r) => `
    <div class="recent-row">
      <div class="recent-row__icon">${r.score_pct >= 100 ? "★" : "✓"}</div>
      <div class="recent-row__main">
        <div class="recent-row__title">${r.title}</div>
        <div class="recent-row__unit">${r.unit_title}</div>
      </div>
      <div class="recent-row__meta">
        <div class="recent-row__score">${r.score_pct}%</div>
        <div class="recent-row__when">${relativeKo(r.completed_at)}</div>
      </div>
    </div>
  `).join("");
}

async function init() {
  const me = await api.get("/auth/me.php");
  if (!me.ok || !me.data?.user) {
    window.location.replace("/login.html");
    return;
  }
  const res = await api.get("/me/overview.php");
  if (!res.ok) {
    if (window.toast) window.toast(res.error || "프로필을 불러오지 못했어요.", { variant: "danger" });
    return;
  }
  const { user, counters, weekly_xp, recent, equipped, items } = res.data;

  renderUser(user);
  renderStats(user, counters);
  renderWeekly(weekly_xp);
  renderRecent(recent);

  renderMascotInto($("#aside-mascot"), { equipped, items, size: 300 });
}

init();
