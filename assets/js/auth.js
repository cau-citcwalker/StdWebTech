/* =============================================================
 * FinEdu — 인증 페이지 스크립트 (login / signup 공용)
 *
 * - 폼 제출 → fetch 호출 → 토스트/배너로 결과 표시
 * - 인풋별 inline 에러 표시 (서버가 fields 로 돌려주는 경우)
 * - 비밀번호 표시 토글
 * - 이미 로그인되어 있으면 /learn 으로 보냄
 * ============================================================= */

import { api } from "./api.js";

/* -- 페이지 진입 시 세션 체크 ------------------------------ */
(async function bootstrapAuthPage() {
  const me = await api.get("/auth/me.php");
  if (me.ok && me.data?.user) {
    window.location.replace("/learn");
  }
})();

/* -- 비밀번호 표시 토글 ------------------------------------ */
document.querySelectorAll(".password-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.querySelector(btn.dataset.target);
    if (!target) return;
    const isPwd = target.type === "password";
    target.type = isPwd ? "text" : "password";
    btn.setAttribute("aria-pressed", isPwd ? "true" : "false");
  });
});

/* -- 폼 핸들러 ---------------------------------------------- */
function clearFieldErrors(form) {
  form.querySelectorAll(".field--error").forEach((f) => f.classList.remove("field--error"));
  form.querySelectorAll(".field__error").forEach((e) => (e.textContent = ""));
  const banner = form.querySelector(".form-banner");
  if (banner) {
    banner.classList.remove("is-shown");
    banner.textContent = "";
  }
}

function applyFieldErrors(form, fields) {
  Object.entries(fields || {}).forEach(([name, msg]) => {
    const input = form.querySelector(`[name="${name}"]`);
    const wrap = input?.closest(".field");
    if (!wrap) return;
    wrap.classList.add("field--error");
    const err = wrap.querySelector(".field__error");
    if (err) err.textContent = msg;
  });
}

function showBanner(form, message) {
  const banner = form.querySelector(".form-banner");
  if (!banner) return;
  banner.textContent = message;
  banner.classList.add("is-shown");
}

function setSubmitLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalLabel = btn.textContent;
    btn.textContent = "잠시만요…";
    btn.setAttribute("aria-disabled", "true");
  } else {
    if (btn.dataset.originalLabel) btn.textContent = btn.dataset.originalLabel;
    btn.removeAttribute("aria-disabled");
  }
}

async function handleSubmit(form, endpoint, successMsg, redirect = "/learn") {
  clearFieldErrors(form);

  const data = Object.fromEntries(new FormData(form).entries());
  const submitBtn = form.querySelector("[type='submit']");
  setSubmitLoading(submitBtn, true);

  const res = await api.post(endpoint, data);

  setSubmitLoading(submitBtn, false);

  if (!res.ok) {
    if (res.extra?.fields) applyFieldErrors(form, res.extra.fields);
    showBanner(form, res.error || "요청을 처리하지 못했어요.");
    if (window.toast) window.toast(res.error || "요청 실패", { variant: "danger" });
    return;
  }

  if (window.toast) window.toast(successMsg, { variant: "success" });
  window.location.assign(redirect);
}

const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit(signupForm, "/auth/signup.php", "환영해요! 첫 레슨으로 가요.");
  });
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit(loginForm, "/auth/login.php", "다시 만나서 반가워요!");
  });
}
