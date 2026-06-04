/* =============================================================
 * FinEdu — 계정 설정 (/settings.html)
 * ============================================================= */

import { api } from "./api.js";

const $ = (sel, el = document) => el.querySelector(sel);

async function loadCurrent() {
  const res = await api.get("/auth/me.php");
  if (!res.ok || !res.data?.user) {
    window.location.replace("/login.html");
    return null;
  }
  const u = res.data.user;
  $("#settings-current").textContent = `현재 아이디: @${u.username}  ·  이메일: ${u.email}`;
  return u;
}

function setBusy(btn, busy, originalText) {
  btn.disabled = busy;
  btn.textContent = busy ? "처리 중…" : originalText;
}

async function handlePost(form, url, build, successMsg, onSuccess) {
  const btn = form.querySelector("button[type=submit]");
  const orig = btn.textContent;
  setBusy(btn, true, orig);
  try {
    const body = build();
    if (body === null) { setBusy(btn, false, orig); return; }
    const res = await api.post(url, body);
    if (!res.ok) {
      if (window.toast) window.toast(res.error || "요청 실패", { variant: "danger" });
      setBusy(btn, false, orig);
      return;
    }
    if (window.toast) window.toast(successMsg, { variant: "success" });
    form.reset();
    setBusy(btn, false, orig);
    if (onSuccess) onSuccess(res.data);
  } catch (e) {
    if (window.toast) window.toast("네트워크 오류", { variant: "danger" });
    setBusy(btn, false, orig);
  }
}

function init() {
  loadCurrent();

  $("#form-username").addEventListener("submit", (e) => {
    e.preventDefault();
    handlePost(e.target, "/account/update_username.php", () => ({
      current_password: $("#u-current-password").value,
      new_username:     $("#u-new-username").value.trim(),
    }), "아이디 변경 완료!", () => loadCurrent());
  });

  $("#form-email").addEventListener("submit", (e) => {
    e.preventDefault();
    handlePost(e.target, "/account/update_email.php", () => ({
      current_password: $("#e-current-password").value,
      new_email:        $("#e-new-email").value.trim(),
    }), "이메일 변경 완료!", () => loadCurrent());
  });

  $("#form-password").addEventListener("submit", (e) => {
    e.preventDefault();
    const next = $("#p-new-password").value;
    const confirm = $("#p-new-password-confirm").value;
    if (next !== confirm) {
      if (window.toast) window.toast("새 비밀번호 확인이 일치하지 않아요.", { variant: "danger" });
      return;
    }
    handlePost(e.target, "/account/update_password.php", () => ({
      current_password: $("#p-current-password").value,
      new_password:     next,
    }), "비밀번호 변경 완료. 다른 디바이스는 자동 로그아웃돼요.");
  });

  $("#form-delete").addEventListener("submit", (e) => {
    e.preventDefault();
    const confirmText = $("#d-confirm").value.trim();
    if (confirmText !== "DELETE") {
      if (window.toast) window.toast("확인 문구는 DELETE 정확히 입력해 주세요.", { variant: "danger" });
      return;
    }
    if (!window.confirm("정말 계정을 영구 삭제할까요? 복구할 수 없습니다.")) return;
    handlePost(e.target, "/account/delete.php", () => ({
      current_password: $("#d-current-password").value,
      confirm:          "DELETE",
    }), "계정이 삭제되었습니다. 안녕히 가세요.", () => {
      setTimeout(() => { window.location.href = "/"; }, 1200);
    });
  });
}

init();
