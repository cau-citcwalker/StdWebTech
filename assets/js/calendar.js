/* =============================================================
 * FinEdu — 학습 캘린더 (/calendar.html)
 * ============================================================= */

import { api } from "./api.js";

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,  // 1..12
  data: null,
  selected: null,            // 'YYYY-MM-DD'
  showFriends: false,        // 친구 오버레이 토글 (localStorage 영속)
  friendsData: null,         // { friends_completed_by_date, total_friends }
};

// localStorage 에서 친구 오버레이 토글 복원
try {
  state.showFriends = localStorage.getItem("finedu-cal-friends") === "1";
} catch (_) {}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}
function pad(n) { return String(n).padStart(2, "0"); }
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function renderHeader() {
  $("#cal-label").textContent = `${state.year}년 ${state.month}월`;
  const s = state.data?.stats;
  if (s) {
    $("#cal-stats").textContent =
      `이번 달 ${s.completed_count_in_month}일 학습 · 누적 ${s.total_lessons_completed}개 · 스트릭 D-${s.streak_days}`;
  }
}

function renderGrid() {
  const grid = $("#cal-grid");
  const firstDay = new Date(state.year, state.month - 1, 1);
  const startDow = firstDay.getDay();       // 0(일)..6(토)
  const lastDate = new Date(state.year, state.month, 0).getDate();
  const prevLast = new Date(state.year, state.month - 1, 0).getDate();
  const today = todayStr();
  const completed = new Set(state.data?.completed_dates ?? []);
  const eventsByDate = {};
  (state.data?.events ?? []).forEach((e) => {
    (eventsByDate[e.event_date] ||= []).push(e);
  });

  // 친구 활동 (오버레이 ON 일 때만)
  const friendsByDate = (state.showFriends && state.friendsData?.friends_completed_by_date) || {};

  const cells = [];

  // 이전 달 마지막 며칠 (회색)
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevLast - i;
    cells.push(`<div class="cal-cell cal-cell--out">${d}</div>`);
  }
  // 현재 달
  for (let d = 1; d <= lastDate; d++) {
    const iso = `${state.year}-${pad(state.month)}-${pad(d)}`;
    const isToday    = iso === today;
    const isDone     = completed.has(iso);
    const hasEvent   = !!eventsByDate[iso];
    const isSelected = iso === state.selected;
    const friendCount = (friendsByDate[iso] || []).length;
    // 강도 1~4 (1=1명, 2=2-3명, 3=4-5명, 4=6+명)
    let intensity = 0;
    if (friendCount >= 1) intensity = 1;
    if (friendCount >= 2) intensity = 2;
    if (friendCount >= 4) intensity = 3;
    if (friendCount >= 6) intensity = 4;
    const classes = [
      "cal-cell",
      isToday    ? "is-today"    : "",
      isDone     ? "is-done"     : "",
      hasEvent   ? "has-event"   : "",
      isSelected ? "is-selected" : "",
      intensity > 0 ? `cal-cell--friends-${intensity}` : "",
    ].filter(Boolean).join(" ");
    cells.push(`
      <button class="${classes}" type="button" data-date="${iso}">
        <span class="cal-cell__num">${d}</span>
        ${isDone   ? '<span class="cal-cell__dot cal-cell__dot--done" aria-label="학습완료"></span>' : ""}
        ${hasEvent ? `<span class="cal-cell__dot cal-cell__dot--event" aria-label="이벤트 ${eventsByDate[iso].length}개"></span>` : ""}
        ${friendCount > 0 ? `<span class="cal-cell__dot cal-cell__dot--friends" aria-label="친구 ${friendCount}명 학습"></span>` : ""}
      </button>
    `);
  }
  // 끝 빈칸 (총 42 셀 = 6주)
  const filled = cells.length;
  const trail = ((Math.ceil(filled / 7) * 7) - filled);
  for (let i = 1; i <= trail; i++) {
    cells.push(`<div class="cal-cell cal-cell--out">${i}</div>`);
  }
  grid.innerHTML = cells.join("");

  // 클릭 핸들러
  $$(".cal-cell[data-date]", grid).forEach((c) => {
    c.addEventListener("click", () => selectDate(c.dataset.date));
  });
}

function selectDate(iso) {
  state.selected = iso;
  renderGrid();
  renderDetail(iso);
}

function relDate(iso) {
  if (!iso) return "";
  const t = new Date(iso.replace(" ", "T")).getTime();
  const d = (Date.now() - t) / 1000;
  if (d < 60) return "방금 전";
  if (d < 3600) return `${Math.floor(d/60)}분 전`;
  if (d < 86400) return `${Math.floor(d/3600)}시간 전`;
  return iso.slice(0, 10);
}

function renderDetail(iso) {
  const host = $("#cal-detail");
  const titleEl = $("#cal-detail-title");
  const bodyEl  = $("#cal-detail-body");
  host.hidden = false;
  const [y, m, d] = iso.split("-").map(Number);
  const dayLabel = new Date(iso).toLocaleDateString("ko-KR", { weekday: "short" });
  titleEl.textContent = `${y}년 ${m}월 ${d}일 (${dayLabel})`;

  const completed = (state.data?.completed_dates ?? []).includes(iso);
  const events = (state.data?.events ?? []).filter((e) => e.event_date === iso);

  let html = "";
  if (completed) html += `<div class="cal-flag cal-flag--done">✅ 이 날 레슨을 풀었어요!</div>`;

  // 친구 학습 (오버레이 ON 일 때만)
  const friendsHere = (state.showFriends && state.friendsData?.friends_completed_by_date?.[iso]) || [];
  if (friendsHere.length) {
    html += `<div>
      <div style="font-weight: var(--fw-bold); color: var(--color-text-soft); font-size: var(--fs-13);">
        💜 친구 ${friendsHere.length}명도 이 날 학습했어요
      </div>
      <ul class="cal-friends-list">
        ${friendsHere.map((f) => `<li>
          <a href="/friend?id=${f.user_id}">${esc(f.display_name)}</a>
          <span style="color: var(--color-text-muted);">@${esc(f.username)}</span>
        </li>`).join("")}
      </ul>
    </div>`;
  }

  if (events.length === 0) {
    html += `<p class="cal-detail__empty">아직 이 날 등록된 일정이 없어요.</p>`;
  } else {
    html += `<ul class="cal-event-list">${events.map((e) => `
      <li class="cal-event" data-id="${e.id}">
        <div class="cal-event__main">
          <div class="cal-event__title">${esc(e.title)}</div>
          ${e.note ? `<div class="cal-event__note">${esc(e.note).replace(/\n/g,"<br>")}</div>` : ""}
        </div>
        <div class="cal-event__actions">
          <button class="btn btn--ghost btn--sm" data-action="edit" data-id="${e.id}">수정</button>
          <button class="btn btn--ghost btn--sm" data-action="delete" data-id="${e.id}">삭제</button>
        </div>
      </li>
    `).join("")}</ul>`;
  }

  html += `
    <form id="cal-event-form" class="cal-event-form">
      <h3>+ 새 일정</h3>
      <div class="field">
        <label class="field__label">제목</label>
        <input id="ce-title" class="input" type="text" maxlength="120" required placeholder="예) 시장과 가격 단원 끝내기" />
      </div>
      <div class="field">
        <label class="field__label">메모 (선택)</label>
        <textarea id="ce-note" class="textarea" rows="2" maxlength="500" placeholder="..."></textarea>
      </div>
      <div class="cal-event-form__actions">
        <button type="submit" class="btn btn--sm">일정 추가</button>
      </div>
    </form>
  `;
  bodyEl.innerHTML = html;

  // 액션 핸들러
  bodyEl.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const ev = events.find((e) => e.id === id);
      if (!ev) return;
      if (btn.dataset.action === "edit") inlineEdit(ev);
      else handleDelete(ev);
    });
  });

  $("#cal-event-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = $("#ce-title").value.trim();
    const note  = $("#ce-note").value.trim();
    if (title.length < 1) { window.toast?.("제목을 입력해 주세요.", { variant: "danger" }); return; }
    const submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    const res = await api.post("/calendar/event_create.php", {
      event_date: iso, title, note,
    });
    submitBtn.disabled = false;
    if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
    window.toast?.("일정을 추가했어요.");
    await reload(); // re-fetch month
    selectDate(iso);
  });
}

function inlineEdit(ev) {
  const li = document.querySelector(`.cal-event[data-id="${ev.id}"] .cal-event__main`);
  if (!li) return;
  const orig = li.innerHTML;
  li.innerHTML = `
    <form class="cal-event-edit">
      <input class="input" name="title" value="${esc(ev.title)}" maxlength="120" required />
      <textarea class="textarea" name="note" rows="2" maxlength="500">${esc(ev.note ?? "")}</textarea>
      <div class="cal-event-form__actions">
        <button type="button" class="btn btn--ghost btn--sm" data-cancel>취소</button>
        <button type="submit" class="btn btn--sm">저장</button>
      </div>
    </form>
  `;
  const form = li.querySelector("form");
  form.querySelector("[data-cancel]").addEventListener("click", () => { li.innerHTML = orig; });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const res = await api.post("/calendar/event_update.php", {
      id: ev.id,
      event_date: ev.event_date,
      title: String(fd.get("title") || "").trim(),
      note:  String(fd.get("note") || "").trim(),
    });
    if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
    window.toast?.("일정 수정 완료");
    await reload();
    selectDate(state.selected);
  });
}

async function handleDelete(ev) {
  if (!confirm("이 일정을 삭제할까요?")) return;
  const res = await api.post("/calendar/event_delete.php", { id: ev.id });
  if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
  window.toast?.("일정 삭제됨");
  await reload();
  selectDate(state.selected);
}

async function reload() {
  const res = await api.get(`/calendar/month.php?year=${state.year}&month=${state.month}`);
  if (!res.ok) {
    if (res.status === 401) { location.replace("/login.html"); return; }
    window.toast?.(res.error || "불러오기 실패", { variant: "danger" });
    return;
  }
  state.data = res.data;
  // 친구 데이터는 토글 ON 일 때만 fetch (캐싱 안 함 — 월 변할 때마다 새로)
  if (state.showFriends) {
    const fr = await api.get(`/calendar/friends_month.php?year=${state.year}&month=${state.month}`);
    state.friendsData = fr.ok ? fr.data : null;
  } else {
    state.friendsData = null;
  }
  renderHeader();
  renderGrid();
}

/* -------------------------------------------------------------
 * 초기화
 * ------------------------------------------------------------- */
function shiftMonth(delta) {
  let m = state.month + delta;
  let y = state.year;
  if (m < 1) { m = 12; y--; }
  if (m > 12) { m = 1; y++; }
  state.month = m; state.year = y;
  state.selected = null;
  $("#cal-detail").hidden = true;
  reload();
}

$("#cal-prev").addEventListener("click", () => shiftMonth(-1));
$("#cal-next").addEventListener("click", () => shiftMonth(1));
$("#cal-today").addEventListener("click", () => {
  const d = new Date();
  state.year = d.getFullYear();
  state.month = d.getMonth() + 1;
  state.selected = null;
  reload();
});
$("#cal-detail-close").addEventListener("click", () => {
  $("#cal-detail").hidden = true;
  state.selected = null;
  renderGrid();
});

// 친구 오버레이 토글
const friendsToggle = document.getElementById("cal-show-friends");
if (friendsToggle) {
  friendsToggle.checked = state.showFriends;
  friendsToggle.addEventListener("change", async (e) => {
    state.showFriends = e.target.checked;
    try { localStorage.setItem("finedu-cal-friends", state.showFriends ? "1" : "0"); } catch (_) {}
    await reload();
    if (state.selected) renderDetail(state.selected);
  });
}

(async function init() {
  const me = await api.get("/auth/me.php");
  if (!me.ok || !me.data?.user) {
    location.replace("/login.html");
    return;
  }
  await reload();
})();
