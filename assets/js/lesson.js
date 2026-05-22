/* =============================================================
 * FinEdu — 레슨 풀이 (`/lesson?id=N`)
 *
 * 흐름:
 *   1) /api/auth/me.php  로그인 체크
 *   2) /api/learn/lesson.php?id=N  으로 문제 불러오기
 *   3) 사용자가 한 문제씩 답하고 "확인" → 답 저장 & 다음
 *   4) 마지막 문제 후 /api/learn/submit.php 로 일괄 채점
 *   5) 결과 화면: 점수, XP, 스트릭, 다시 풀기 / 학습공간으로
 *      통과 시 컨페티 효과
 * ============================================================= */

import { api } from "./api.js";

const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

const params = new URLSearchParams(location.search);
const lessonId = Number(params.get("id"));
const root = $("#lesson-root");
const progressBar = $("#lesson-progress-bar");

const state = {
  lesson: null,
  questions: [],
  index: 0,
  answers: {},       // { [question_id]: string }
  selected: null,    // 현재 선택값 (확정 전)
};

function updateProgress() {
  const total = state.questions.length;
  const done = state.index;
  progressBar.style.width = total ? `${(100 * done) / total}%` : "0%";
}

function setConfirmEnabled(on) {
  const btn = $("#confirm-btn");
  if (!btn) return;
  btn.disabled = !on;
  btn.setAttribute("aria-disabled", on ? "false" : "true");
}

/* -------------------------------------------------------------
 * 렌더러
 * ------------------------------------------------------------- */
function renderQuestion() {
  const q = state.questions[state.index];
  if (!q) {
    submitLesson();
    return;
  }
  state.selected = null;
  setConfirmEnabled(false);
  updateProgress();

  const safePrompt = q.prompt;

  if (q.type === "multiple_choice") {
    const labels = ["A", "B", "C", "D", "E"];
    const optionsHtml = (q.options || []).map((opt, i) => `
      <button class="q-option" type="button" data-value="${i}">
        <span class="q-option__index">${labels[i]}</span>
        <span>${opt}</span>
      </button>
    `).join("");

    root.innerHTML = `
      <article class="q-card">
        <div class="q-card__no">문제 ${state.index + 1} / ${state.questions.length}</div>
        <h2 class="q-card__prompt">${safePrompt}</h2>
        <div class="q-options">${optionsHtml}</div>
      </article>
    `;

    $$(".q-option", root).forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".q-option", root).forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        state.selected = btn.dataset.value;
        setConfirmEnabled(true);
      });
    });
  } else if (q.type === "true_false") {
    root.innerHTML = `
      <article class="q-card">
        <div class="q-card__no">문제 ${state.index + 1} / ${state.questions.length}</div>
        <h2 class="q-card__prompt">${safePrompt}</h2>
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
        setConfirmEnabled(true);
      });
    });
  } else if (q.type === "fill_blank") {
    root.innerHTML = `
      <article class="q-card">
        <div class="q-card__no">문제 ${state.index + 1} / ${state.questions.length}</div>
        <h2 class="q-card__prompt">${safePrompt}</h2>
        <div class="q-blank">
          <input class="input" id="blank-input" type="text" autocomplete="off"
                 inputmode="text" placeholder="여기에 입력" />
        </div>
      </article>
    `;
    const input = $("#blank-input", root);
    input.addEventListener("input", () => {
      state.selected = input.value;
      setConfirmEnabled(input.value.trim().length > 0);
    });
    setTimeout(() => input.focus(), 80);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && state.selected?.trim()) {
        e.preventDefault();
        confirmAnswer();
      }
    });
  }
}

function confirmAnswer() {
  const q = state.questions[state.index];
  if (!q || state.selected == null || state.selected === "") return;
  state.answers[q.id] = String(state.selected);
  state.index += 1;
  renderQuestion();
}

/* -------------------------------------------------------------
 * 제출 + 결과 화면
 * ------------------------------------------------------------- */
async function submitLesson() {
  root.innerHTML = `
    <article class="q-card" aria-busy="true">
      <div class="q-card__no">채점 중</div>
      <h2 class="q-card__prompt">잠시만요, 결과를 정리하고 있어요…</h2>
    </article>
  `;
  $("#confirm-btn")?.setAttribute("hidden", "");

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

function renderDone({ summary, user, results }) {
  // 진행바 끝까지
  progressBar.style.width = "100%";

  const passed = summary.passed;
  const xp = summary.xp_awarded;
  const score = summary.score_pct;
  const streak = user.streak_days;

  const wrongList = results
    .filter((r) => !r.correct)
    .map((r) => `
      <div class="card" style="text-align: left;">
        <div class="badge badge--yellow" style="margin-bottom: 8px;">오답</div>
        <div style="font-weight:800;">${state.questions.find((q) => q.id === r.question_id)?.prompt ?? "문제"}</div>
        <div class="feedback__answer" style="margin-top:6px;">정답: <code>${r.answer}</code></div>
        ${r.explanation ? `<div class="feedback__explain">${r.explanation}</div>` : ""}
      </div>
    `).join("");

  const mascot = `<img class="done-card__mascot" src="assets/img/mascot-dotori.svg" alt="">`;

  root.innerHTML = `
    <div class="done-card">
      ${mascot}
      <h2 class="done-card__title">${passed ? "완벽해요!" : "거의 다 왔어요"}</h2>
      <p class="done-card__sub">
        ${passed
          ? "오늘의 도토리가 자랑스러워해요. 다음 레슨도 도전해 볼까요?"
          : "조금만 더 정답을 맞히면 통과예요. 다시 한 번!"}
      </p>

      <div class="done-stats">
        <div class="done-stat done-stat--score">
          <div class="done-stat__label">점수</div>
          <div class="done-stat__num">${score}<small style="font-size:0.5em;"> %</small></div>
        </div>
        <div class="done-stat done-stat--xp">
          <div class="done-stat__label">XP</div>
          <div class="done-stat__num">+${xp}</div>
        </div>
        <div class="done-stat done-stat--streak">
          <div class="done-stat__label">스트릭</div>
          <div class="done-stat__num">D-${streak}</div>
        </div>
      </div>

      <div class="done-actions">
        ${passed
          ? `<a class="btn btn--lg" href="/learn">학습공간으로 →</a>
             <a class="btn btn--secondary btn--sm" href="javascript:location.reload()">다시 풀기</a>`
          : `<a class="btn btn--lg" href="javascript:location.reload()">다시 풀기</a>
             <a class="btn btn--secondary btn--sm" href="/learn">나중에 하기</a>`}
      </div>

      ${wrongList ? `<div style="margin-top:32px; text-align:left; display: grid; gap: 12px;">
        <h3 style="font-size: 16px; color: var(--color-text-soft); letter-spacing: 0.06em; text-transform: uppercase;">놓친 문제 복습</h3>
        ${wrongList}
      </div>` : ""}
    </div>
  `;
  $("#lesson-bottom")?.setAttribute("hidden", "");
  $("#confirm-btn")?.setAttribute("hidden", "");

  if (passed) launchConfetti();
}

/* -------------------------------------------------------------
 * 컨페티
 * ------------------------------------------------------------- */
function launchConfetti() {
  const colors = ["#58cc02", "#1cb0f6", "#ffc800", "#ce82ff", "#ff86d0", "#ff4b4b"];
  const host = document.createElement("div");
  host.className = "confetti";
  document.body.appendChild(host);
  const N = 120;
  for (let i = 0; i < N; i++) {
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

  // 헤더 제목
  const titleEl = $("#lesson-title");
  if (titleEl) titleEl.textContent = `${state.lesson.unit_title} · ${state.lesson.title}`;

  // 진행도 첫 칸
  updateProgress();
  renderQuestion();
}

$("#confirm-btn")?.addEventListener("click", confirmAnswer);

init();
