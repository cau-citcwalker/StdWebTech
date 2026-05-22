/* =============================================================
 * FinEdu — 학습 맵 (`/learn`)
 *
 * - /api/auth/me.php 로 비로그인 차단
 * - /api/learn/map.php 로 단원/레슨 목록 + 진행도 가져오기
 * - 단원 카드 + 지그재그 노드 렌더
 * - 노드 클릭 → /lesson?id=N
 * - 로그아웃 버튼
 * ============================================================= */

import { api } from "./api.js";

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const lockedIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11 V8 a4 4 0 0 1 8 0 V11"/></svg>`;
const starIcon   = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 14.7 8.6 22 9.3 16.5 14 18.2 21 12 17.3 5.8 21 7.5 14 2 9.3 9.3 8.6Z"/></svg>`;
const checkIcon  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12 10 17 19 7"/></svg>`;
const iconByName = {
  spark:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 v6 M12 16 v6 M2 12 h6 M16 12 h6 M5 5 l4 4 M15 15 l4 4 M5 19 l4 -4 M15 9 l4 -4"/></svg>`,
  compare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6 h12 l-3 -3 m3 3 l-3 3"/><path d="M21 18 h-12 l3 -3 m-3 3 l3 3"/></svg>`,
  arrows:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 v16 M7 4 l-3 3 M7 4 l3 3"/><path d="M17 20 v-16 M17 20 l-3 -3 M17 20 l3 -3"/></svg>`,
  coin:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><text x="12" y="16" font-size="11" font-weight="800" text-anchor="middle" stroke="none" fill="currentColor">₩</text></svg>`,
  chart:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 14 15 20 7"/><polyline points="14 7 20 7 20 13"/></svg>`,
  wave:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M3 12 q 3 -6 6 0 t 6 0 t 6 0"/></svg>`,
  order:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>`,
  pie:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 a9 9 0 1 0 9 9 h-9 z"/></svg>`,
  balance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 8 h18"/><path d="M3 8 l-1 6 a4 4 0 0 0 8 0 l-1 -6"/><path d="M21 8 l-1 6 a4 4 0 0 0 8 0 l-1 -6"/></svg>`,
  rate:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 L20 4"/><path d="M14 4 h6 v6"/><path d="M4 18 h16"/></svg>`,
};

function pickIcon(name) {
  return iconByName[name] || iconByName.spark;
}

function renderNode(lesson) {
  const safeTitle = lesson.title.replace(/"/g, "&quot;");
  const href = lesson.state === "locked" ? "#" : `/lesson?id=${lesson.id}`;
  const aria = lesson.state === "locked" ? ' aria-disabled="true"' : "";
  const icon = lesson.state === "locked" ? lockedIcon : pickIcon(lesson.icon);
  const check = lesson.state === "completed"
    ? `<span class="lesson-node__check">${checkIcon}</span>` : "";

  return `
    <a class="lesson-node" data-state="${lesson.state}" href="${href}"
       title="${safeTitle}"${aria}>
       ${icon}
       ${check}
    </a>
    <div class="lesson-row__caption">
      <div class="lesson-row__caption-title">${safeTitle}</div>
      <div class="lesson-row__caption-sub">+${lesson.xp_reward} XP</div>
    </div>
  `;
}

function renderUnit(unit) {
  const completed = unit.lessons.filter((l) => l.state === "completed").length;
  const total = unit.lessons.length;
  const pct = total === 0 ? 0 : Math.round((100 * completed) / total);

  const rows = unit.lessons
    .map((l) => `<div class="lesson-row">${renderNode(l)}</div>`)
    .join("");

  return `
    <section class="unit-section" style="--unit-color: ${unit.color};">
      <header class="unit-section__head">
        <div>
          <h2 class="unit-section__title">${unit.title}</h2>
          <div class="unit-section__subtitle">${unit.subtitle ?? ""}</div>
        </div>
        <div class="unit-section__progress">
          <div class="progress" aria-hidden="true">
            <div class="progress__bar" style="width:${pct}%;"></div>
          </div>
          <span>${completed}/${total}</span>
        </div>
      </header>
      <div class="lesson-path">${rows}</div>
    </section>
  `;
}

function renderUserStats(user) {
  const wrap = $("#user-stats");
  if (!wrap) return;
  wrap.innerHTML = `
    <span class="stat-chip stat-chip--xp">
      ${starIcon} ${user.xp.toLocaleString("ko-KR")} XP
    </span>
    <span class="stat-chip stat-chip--streak">
      <svg viewBox="0 0 24 24" fill="#ff7a00" stroke="none"><path d="M12 3 c0 4 -5 5 -5 10 a5 5 0 0 0 10 0 c0 -2 -2 -3 -3 -5 c0 3 -2 4 -2 4 z"/></svg>
      D-${user.streak_days}
    </span>
  `;

  const menu = $("#user-menu");
  if (menu) {
    const initial = (user.display_name || "?").trim().slice(0, 1);
    menu.innerHTML = `
      <span class="user-menu__name">${user.display_name}</span>
      <span class="user-menu__avatar">${initial}</span>
    `;
  }

  const hello = $("#hello-name");
  if (hello) hello.textContent = user.display_name;
}

async function init() {
  const me = await api.get("/auth/me.php");
  if (!me.ok || !me.data?.user) {
    window.location.replace("/login");
    return;
  }

  const map = await api.get("/learn/map.php");
  if (!map.ok) {
    if (window.toast) window.toast(map.error || "맵을 불러오지 못했어요.", { variant: "danger" });
    return;
  }

  renderUserStats(map.data.user);
  const root = $("#units-root");
  if (!root) return;

  const units = map.data.units;
  if (!units.length || units.every((u) => u.lessons.length === 0)) {
    root.innerHTML = `
      <div class="learn-empty">
        <img src="assets/img/mascot-dotori.svg" alt="" />
        <h2>아직 준비 중인 단원이에요</h2>
        <p>곧 새로운 단원이 도착해요. 잠시만 기다려 주세요.</p>
      </div>
    `;
    return;
  }
  root.innerHTML = units.map(renderUnit).join("");
}

/* 로그아웃 */
$("#logout-btn")?.addEventListener("click", async (e) => {
  e.preventDefault();
  await api.post("/auth/logout.php");
  window.location.assign("/login");
});

init();
