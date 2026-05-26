/* =============================================================
 * FinEdu — 레슨 풀이 (`/lesson.html?id=N`)
 *
 * 한 문제씩 “즉시 피드백” 흐름:
 *   1) 로그인 체크
 *   2) /api/learn/lesson.php?id=N 으로 문제 받기
 *   3) 사용자가 답 → "확인" → /api/learn/grade.php 호출
 *   4) 슬라이드업 피드백 패널 표시 (정답/오답 + 해설), 효과음
 *   5) "계속" → 다음 문제
 *   6) 마지막 문제 후 /api/learn/submit.php 로 일괄 제출 → 완료 카드 (컨페티)
 * ============================================================= */

import { api } from "./api.js";
import { sfx } from "./sfx.js";

const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

const params = new URLSearchParams(location.search);
const lessonId = Number(params.get("id"));
const root = $("#lesson-root");
const progressBar = $("#lesson-progress-bar");
const bottomBar = $("#lesson-bottom");
const confirmBtn = $("#confirm-btn");

const state = {
  lesson: null,
  questions: [],
  index: 0,
  answers: {},
  selected: null,
  phase: "answer",  // 'answer' | 'feedback'
  lastResult: null, // grade.php 응답
};

function updateProgress() {
  const total = state.questions.length;
  const done = state.index;
  if (progressBar) progressBar.style.width = total ? `${(100 * done) / total}%` : "0%";
}

function setConfirm(enabled, label = "확인 →", variant = "") {
  if (!confirmBtn) return;
  confirmBtn.textContent = label;
  confirmBtn.disabled = !enabled;
  confirmBtn.setAttribute("aria-disabled", enabled ? "false" : "true");
  confirmBtn.className = "btn btn--lg" + (variant ? " " + variant : "");
}

/* -------------------------------------------------------------
 * 문제 렌더링
 * ------------------------------------------------------------- */
function renderQuestion() {
  const q = state.questions[state.index];
  if (!q) { submitLesson(); return; }
  state.selected = null;
  state.phase = "answer";
  if (bottomBar) bottomBar.removeAttribute("hidden");
  setConfirm(false, "확인 →");
  updateProgress();

  if (q.type === "multiple_choice") {
    const labels = ["A", "B", "C", "D", "E"];
    const opts = (q.options || []).map((opt, i) => `
      <button class="q-option" type="button" data-value="${i}">
        <span class="q-option__index">${labels[i]}</span>
        <span>${opt}</span>
      </button>
    `).join("");
    root.innerHTML = `
      <article class="q-card">
        <div class="q-card__no">문제 ${state.index + 1} / ${state.questions.length}</div>
        <h2 class="q-card__prompt">${q.prompt}</h2>
        <div class="q-options">${opts}</div>
      </article>
    `;
    $$(".q-option", root).forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".q-option", root).forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        state.selected = btn.dataset.value;
        setConfirm(true, "확인 →");
        sfx.tap();
      });
    });
  } else if (q.type === "true_false") {
    root.innerHTML = `
      <article class="q-card">
        <div class="q-card__no">문제 ${state.index + 1} / ${state.questions.length}</div>
        <h2 class="q-card__prompt">${q.prompt}</h2>
        <div class="q-tf">
          <button class="q-tf__btn" type="button" data-value="true">O · 맞아요</button>
          <button class="q-tf__btn" type="button" data-value="false">X · 틀려요</button>
        </div>
      </article>
    `;
    $$(".q-tf__btn", root).forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".q-tf__btn", root).forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        state.selected = btn.dataset.value;
        setConfirm(true, "확인 →");
        sfx.tap();
      });
    });
  } else if (q.type === "fill_blank") {
    root.innerHTML = `
      <article class="q-card">
        <div class="q-card__no">문제 ${state.index + 1} / ${state.questions.length}</div>
        <h2 class="q-card__prompt">${q.prompt}</h2>
        <div class="q-blank">
          <input class="input" id="blank-input" type="text" autocomplete="off"
                 inputmode="text" placeholder="여기에 입력" />
        </div>
      </article>
    `;
    const input = $("#blank-input", root);
    input.addEventListener("input", () => {
      state.selected = input.value;
      setConfirm(input.value.trim().length > 0, "확인 →");
    });
    setTimeout(() => input.focus(), 80);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && state.selected?.trim()) {
        e.preventDefault();
        onConfirm();
      }
    });
  }
}

/* -------------------------------------------------------------
 * 피드백 패널
 * ------------------------------------------------------------- */
function hideFeedback() {
  document.querySelector(".feedback")?.remove();
}

function showFeedback(result) {
  hideFeedback();
  const isOk = result.correct;
  const icon = isOk
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="7 12 11 16 17 9"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>`;

  const ans = result.type === "multiple_choice"
    ? `보기 ${"ABCDE"[Number(result.answer)]}`
    : result.answer;

  const panel = document.createElement("aside");
  panel.className = "feedback " + (isOk ? "feedback--ok" : "feedback--bad");
  panel.innerHTML = `
    <div class="container feedback__inner">
      <div>
        <div class="feedback__title">${icon} ${isOk ? "정답이에요!" : "아쉬워요"}</div>
        ${isOk ? "" : `<div class="feedback__answer" style="margin-top:8px;">정답: <code>${ans}</code></div>`}
        ${result.explanation ? `<p class="feedback__explain">${result.explanation}</p>` : ""}
      </div>
      <button id="continue-btn" class="btn btn--lg ${isOk ? "" : "btn--red"}" type="button">계속 →</button>
    </div>
  `;
  document.body.appendChild(panel);
  requestAnimationFrame(() => panel.classList.add("is-shown"));

  panel.querySelector("#continue-btn").addEventListener("click", () => {
    // 현재 문제 답을 기록
    const current = state.questions[state.index];
    state.answers[current.id] = String(state.selected);
    hideFeedback();
    state.index += 1;
    if (state.index >= state.questions.length) {
      submitLesson();
    } else {
      renderQuestion();
    }
  });

  if (isOk) sfx.correct(); else sfx.wrong();
  // confirm 버튼은 피드백 동안 숨기기 — 패널 안의 “계속” 으로 진행
  if (bottomBar) bottomBar.setAttribute("hidden", "");
}

/* -------------------------------------------------------------
 * 확인 클릭
 * ------------------------------------------------------------- */
async function onConfirm() {
  if (state.phase !== "answer") return;
  const q = state.questions[state.index];
  if (!q || state.selected == null || state.selected === "") return;

  state.phase = "feedback";
  setConfirm(false, "채점 중…");

  const res = await api.post("/learn/grade.php", {
    question_id: q.id,
    answer: String(state.selected),
  });

  if (!res.ok) {
    if (window.toast) window.toast(res.error || "채점 실패", { variant: "danger" });
    state.phase = "answer";
    setConfirm(true, "확인 →");
    return;
  }
  state.lastResult = res.data;
  showFeedback(res.data);
}

confirmBtn?.addEventListener("click", onConfirm);

/* -------------------------------------------------------------
 * 마지막 제출 + 완료 화면
 * ------------------------------------------------------------- */
async function submitLesson() {
  hideFeedback();
  if (bottomBar) bottomBar.setAttribute("hidden", "");
  root.innerHTML = `
    <article class="q-card" aria-busy="true">
      <div class="q-card__no">결과 정리 중</div>
      <h2 class="q-card__prompt">잠시만요…</h2>
    </article>
  `;

  const res = await api.post("/learn/submit.php", {
    lesson_id: lessonId,
    answers: state.answers,
  });
  if (!res.ok) {
    if (window.toast) window.toast(res.error || "제출 실패", { variant: "danger" });
    return;
  }
  renderDone(res.data);
}

function renderDone({ summary, user, rewards }) {
  if (progressBar) progressBar.style.width = "100%";
  const passed = summary.passed;
  const xpGain   = rewards?.xp_awarded ?? summary.xp_awarded;
  const coinGain = rewards?.coins_awarded ?? 0;

  root.innerHTML = `
    <div class="done-card">
      <img class="done-card__mascot" src="assets/img/mascot-dotori.svg" alt="">
      <h2 class="done-card__title">${passed ? "완벽해요!" : "거의 다 왔어요"}</h2>
      <p class="done-card__sub">
        ${passed
          ? "오늘의 도토리가 자랑스러워해요. 다음 레슨도 도전!"
          : "조금만 더 정답을 맞히면 통과예요. 한 번 더 도전해 볼까요?"}
      </p>

      <div class="done-stats" style="grid-template-columns: repeat(4, 1fr);">
        <div class="done-stat done-stat--score">
          <div class="done-stat__label">점수</div>
          <div class="done-stat__num">${summary.score_pct}<small style="font-size:0.5em;"> %</small></div>
        </div>
        <div class="done-stat done-stat--xp">
          <div class="done-stat__label">XP</div>
          <div class="done-stat__num">+${xpGain}</div>
        </div>
        <div class="done-stat done-stat--coin">
          <div class="done-stat__label">코인</div>
          <div class="done-stat__num">+${coinGain}</div>
        </div>
        <div class="done-stat done-stat--streak">
          <div class="done-stat__label">스트릭</div>
          <div class="done-stat__num">D-${user.streak_days}</div>
        </div>
      </div>

      <div class="done-actions">
        ${passed
          ? `<a class="btn btn--lg" href="/learn.html">학습공간으로 →</a>
             <a class="btn btn--secondary btn--sm" href="javascript:location.reload()">다시 풀기</a>`
          : `<a class="btn btn--lg" href="javascript:location.reload()">다시 풀기</a>
             <a class="btn btn--secondary btn--sm" href="/learn.html">나중에 하기</a>`}
      </div>
    </div>
  `;
  if (passed) { launchConfetti(); sfx.win(); }
}

function launchConfetti() {
  const colors = ["#58cc02", "#1cb0f6", "#ffc800", "#ce82ff", "#ff86d0", "#ff4b4b"];
  const host = document.createElement("div");
  host.className = "confetti";
  document.body.appendChild(host);
  for (let i = 0; i < 120; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "vw";
    s.style.background = colors[i % colors.length];
    s.style.animationDuration = 1.6 + Math.random() * 1.6 + "s";
    s.style.animationDelay = Math.random() * 0.6 + "s";
    s.style.transform = `rotate(${Math.random() * 360}deg)`;
    host.appendChild(s);
  }
  setTimeout(() => host.remove(), 4500);
}

/* -------------------------------------------------------------
 * 초기화
 * ------------------------------------------------------------- */
async function init() {
  if (!lessonId) {
    root.innerHTML = `<article class="q-card"><h2 class="q-card__prompt">잘못된 레슨 주소예요.</h2></article>`;
    return;
  }
  const me = await api.get("/auth/me.php");
  if (!me.ok || !me.data?.user) {
    window.location.replace(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
    return;
  }
  const res = await api.get(`/learn/lesson.php?id=${lessonId}`);
  if (!res.ok) {
    if (window.toast) window.toast(res.error || "레슨을 불러오지 못했어요.", { variant: "danger" });
    return;
  }
  state.lesson = res.data.lesson;
  state.questions = res.data.questions;
  if (state.questions.length === 0) {
    root.innerHTML = `<article class="q-card"><h2 class="q-card__prompt">아직 문제가 준비되지 않았어요.</h2></article>`;
    return;
  }
  updateProgress();
  renderQuestion();
}

init();
