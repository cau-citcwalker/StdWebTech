/* =============================================================
 * FinEdu — 학습 Q&A 게시글 상세 (/qna_post.html?id=N)
 * ============================================================= */

import { api } from "./api.js";

const $ = (sel, el = document) => el.querySelector(sel);

const CATS = {
  general: "일반",
  stock:   "경제",
  market:  "시장",
  basics:  "기초",
  macro:   "거시",
  asset:   "금융",
  tax:     "세금·연금",
};

const postId = Number(new URLSearchParams(location.search).get("id") || 0);
if (!postId) {
  $("#qna-post").innerHTML = "잘못된 주소예요.";
}

const state = { post: null, replies: [], loggedIn: false };

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}
function escMultiline(s) {
  return esc(s)
    .replace(/\bhttps?:\/\/[^\s<]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`)
    .replace(/@([A-Za-z0-9_]{3,40})/g, (m, u) => `<a class="qna-mention" href="/qna.html?q=${encodeURIComponent('@' + u)}" data-mention="${u}">@${u}</a>`)
    .replace(/\n/g, "<br>");
}
function relDate(iso) {
  if (!iso) return "";
  const t = new Date(iso.replace(" ", "T")).getTime();
  const d = (Date.now() - t) / 1000;
  if (d < 60) return "방금 전";
  if (d < 3600) return `${Math.floor(d / 60)}분 전`;
  if (d < 86400) return `${Math.floor(d / 3600)}시간 전`;
  if (d < 86400 * 7) return `${Math.floor(d / 86400)}일 전`;
  return iso.slice(0, 10);
}
function avatar(name) { return (name || "?").trim().slice(0, 1); }

function renderPost(p) {
  document.title = `${p.title} · FinEdu`;
  $("#qna-post").removeAttribute("aria-busy");
  $("#qna-post").innerHTML = `
    <header class="qna-post__head">
      <span class="qna-row__cat qna-row__cat--${p.category}">${esc(CATS[p.category] ?? p.category)}</span>
      <h1 class="qna-post__title">${esc(p.title)}</h1>
      <div class="qna-post__meta">
        <span class="reply-card__avatar">${esc(avatar(p.author.display_name))}</span>
        <div>
          <div class="qna-post__author">${esc(p.author.display_name)} <span class="qna-post__handle">@${esc(p.author.username)}</span></div>
          <div class="qna-post__time">${relDate(p.created_at)}${p.updated_at ? " · 수정됨" : ""}</div>
        </div>
        ${p.is_mine ? `
          <div class="qna-post__actions">
            <button class="btn btn--secondary btn--sm" id="post-edit">수정</button>
            <button class="btn btn--ghost btn--sm" id="post-delete">삭제</button>
          </div>` : ""}
      </div>
    </header>
    <div class="qna-post__body">${escMultiline(p.body)}</div>
  `;
  if (p.is_mine) {
    $("#post-edit").addEventListener("click", () => openPostEditor(p));
    $("#post-delete").addEventListener("click", async () => {
      if (!confirm("이 질문을 삭제할까요? 답글도 모두 사라집니다.")) return;
      const res = await api.post("/qna/delete.php", { id: p.id });
      if (!res.ok) { window.toast?.(res.error || "삭제 실패", { variant: "danger" }); return; }
      window.toast?.("질문이 삭제됐어요.");
      location.href = "/qna.html";
    });
  }
}

function renderReplies(replies) {
  $("#reply-count").textContent = replies.length;
  const host = $("#reply-list");
  if (replies.length === 0) {
    host.innerHTML = `<div class="qna-empty">아직 답글이 없어요. 첫 답글을 남겨주세요!</div>`;
    renderReplyForm();
    return;
  }

  // 트리 구성: parent_reply_id 로 children 그룹화
  const byParent = new Map();
  for (const r of replies) {
    const p = r.parent_reply_id ?? 0;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(r);
  }

  // 재귀 렌더 (depth 로 indent — 깊이 2 까지만 들여쓰기, 그 이상은 깊이 2 로 fix)
  const renderNode = (r, depth) => {
    const children = byParent.get(r.id) || [];
    const safeDepth = Math.min(depth, 2);
    return `
      <article id="reply-${r.id}" class="reply-card reply-card--depth-${safeDepth} ${r.is_mine ? "reply-card--mine" : ""}" data-id="${r.id}">
        <div class="reply-card__head">
          <span class="reply-card__avatar">${esc(avatar(r.author.display_name))}</span>
          <div>
            <div class="reply-card__name">${esc(r.author.display_name)}${r.is_mine ? ` <span class="badge badge--brand">내 답글</span>` : ""}</div>
            <div class="reply-card__handle">@${esc(r.author.username)} · ${relDate(r.created_at)}${r.updated_at ? " · 수정됨" : ""}</div>
          </div>
          <div class="reply-card__actions">
            ${state.loggedIn ? `<button class="btn btn--ghost btn--sm" data-action="reply" data-id="${r.id}" data-username="${esc(r.author.username)}">↩ 답글</button>` : ""}
            ${r.is_mine ? `
              <button class="btn btn--ghost btn--sm" data-action="edit" data-id="${r.id}">수정</button>
              <button class="btn btn--ghost btn--sm" data-action="delete" data-id="${r.id}">삭제</button>
            ` : ""}
          </div>
        </div>
        <div class="reply-card__body" data-bodyfor="${r.id}">${escMultiline(r.body)}</div>
        <div class="reply-card__inline-form" data-inline-for="${r.id}" hidden></div>
        ${children.length ? `<div class="reply-card__children">
          ${children.map((c) => renderNode(c, depth + 1)).join("")}
        </div>` : ""}
      </article>
    `;
  };

  const roots = byParent.get(0) || [];
  host.innerHTML = roots.map((r) => renderNode(r, 0)).join("");

  host.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const r = state.replies.find((x) => x.id === id);
      if (!r) return;
      const action = btn.dataset.action;
      if      (action === "edit")   replaceReplyWithEditor(r);
      else if (action === "delete") handleReplyDelete(r);
      else if (action === "reply")  openInlineReply(r, btn.dataset.username);
    });
  });

  renderReplyForm();

  // 해시 (#reply-N) 가 있으면 해당 답글로 스크롤
  if (location.hash.startsWith("#reply-")) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("reply-card--flash");
      setTimeout(() => target.classList.remove("reply-card--flash"), 2400);
    }
  }
}

function openInlineReply(parent, parentUsername) {
  const host = document.querySelector(`[data-inline-for="${parent.id}"]`);
  if (!host) return;
  host.hidden = false;
  host.innerHTML = `
    <form class="reply-form reply-form--inline">
      <textarea class="textarea" rows="3" maxlength="5000" placeholder="@${parentUsername} 에게 답글…">@${parentUsername} </textarea>
      <div class="reply-form__actions">
        <button type="button" class="btn btn--ghost btn--sm" data-cancel>취소</button>
        <button type="submit" class="btn btn--sm">답글 등록</button>
      </div>
    </form>
  `;
  const form = host.querySelector("form");
  const ta = form.querySelector("textarea");
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
  form.querySelector("[data-cancel]").addEventListener("click", () => { host.hidden = true; host.innerHTML = ""; });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = ta.value.trim();
    if (body.length < 2) { window.toast?.("2자 이상.", { variant: "danger" }); return; }
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    const res = await api.post("/qna/reply.php", {
      post_id: postId, body, parent_reply_id: parent.id,
    });
    submitBtn.disabled = false;
    if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
    window.toast?.("답글 등록 완료");
    await reload();
  });
}

function renderReplyForm() {
  const host = $("#reply-form-host");
  if (!state.loggedIn) {
    host.innerHTML = `<div class="qna-empty"><a href="/login.html">로그인</a> 하면 답글을 달 수 있어요.</div>`;
    return;
  }
  host.innerHTML = `
    <form id="reply-form" class="reply-form">
      <textarea id="reply-body" class="textarea" rows="3" maxlength="5000" placeholder="답글을 입력하세요..." required></textarea>
      <div class="reply-form__actions">
        <button class="btn btn--sm" type="submit">답글 등록</button>
      </div>
    </form>
  `;
  $("#reply-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = $("#reply-body").value.trim();
    if (body.length < 2) { window.toast?.("2자 이상 입력해 주세요.", { variant: "danger" }); return; }
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    const res = await api.post("/qna/reply.php", { post_id: postId, body });
    btn.disabled = false;
    if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
    window.toast?.("답글 등록 완료!");
    await reload();
  });
}

function replaceReplyWithEditor(r) {
  const bodyEl = document.querySelector(`[data-bodyfor="${r.id}"]`);
  if (!bodyEl) return;
  const orig = bodyEl.innerHTML;
  bodyEl.innerHTML = `
    <form class="reply-edit-form">
      <textarea class="textarea" rows="3" maxlength="5000">${esc(r.body)}</textarea>
      <div class="reply-form__actions">
        <button type="button" class="btn btn--ghost btn--sm" data-cancel>취소</button>
        <button type="submit" class="btn btn--sm">저장</button>
      </div>
    </form>
  `;
  const form = bodyEl.querySelector("form");
  form.querySelector("[data-cancel]").addEventListener("click", () => { bodyEl.innerHTML = orig; });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const t = form.querySelector("textarea").value.trim();
    if (t.length < 2) { window.toast?.("2자 이상.", { variant: "danger" }); return; }
    const res = await api.post("/qna/reply_update.php", { id: r.id, body: t });
    if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
    window.toast?.("답글 수정 완료");
    await reload();
  });
}

async function handleReplyDelete(r) {
  if (!confirm("이 답글을 삭제할까요?")) return;
  const res = await api.post("/qna/reply_delete.php", { id: r.id });
  if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
  window.toast?.("답글 삭제됨");
  await reload();
}

/* -------------------------------------------------------------
 * 게시글 수정 모달 — qna.js 의 openEditor 와 비슷한 패턴, 여기 자체 정의
 * ------------------------------------------------------------- */
function openPostEditor(p) {
  const host = $("#qna-modal-host");
  host.innerHTML = `
    <div class="qna-modal-host">
      <div class="qna-modal" role="dialog" aria-modal="true">
        <header class="qna-modal__head">
          <h2>질문 수정</h2>
          <button class="qna-modal__close" type="button" aria-label="닫기">✕</button>
        </header>
        <form id="qf" class="qna-form">
          <div class="field">
            <label class="field__label">카테고리</label>
            <select id="qf-cat" class="select">
              ${Object.entries(CATS).map(([k, l]) =>
                `<option value="${k}" ${k === p.category ? "selected" : ""}>${l}</option>`
              ).join("")}
            </select>
          </div>
          <div class="field">
            <label class="field__label">제목</label>
            <input id="qf-title" class="input" maxlength="200" required value="${esc(p.title)}" />
          </div>
          <div class="field">
            <label class="field__label">본문</label>
            <textarea id="qf-body" class="textarea" rows="8" maxlength="10000" required>${esc(p.body)}</textarea>
          </div>
          <div class="qna-form__actions">
            <button type="button" class="btn btn--ghost btn--sm" id="qf-cancel">취소</button>
            <button type="submit" class="btn">수정 저장</button>
          </div>
        </form>
      </div>
    </div>
  `;
  const close = () => { host.innerHTML = ""; };
  $(".qna-modal__close").addEventListener("click", close);
  $("#qf-cancel").addEventListener("click", close);
  host.querySelector(".qna-modal-host").addEventListener("click", (e) => {
    if (e.target === host.querySelector(".qna-modal-host")) close();
  });
  $("#qf").addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await api.post("/qna/update.php", {
      id: p.id,
      category: $("#qf-cat").value,
      title: $("#qf-title").value.trim(),
      body:  $("#qf-body").value.trim(),
    });
    if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
    window.toast?.("수정 완료");
    close();
    reload();
  });
}

async function reload() {
  const res = await api.get(`/qna/get.php?id=${postId}`);
  if (!res.ok) {
    $("#qna-post").innerHTML = `<p>${res.error || "불러오기 실패"}</p>`;
    return;
  }
  state.post = res.data.post;
  state.replies = res.data.replies;
  renderPost(state.post);
  renderReplies(state.replies);
}

(async function init() {
  try {
    const me = await api.get("/auth/me.php");
    state.loggedIn = !!(me.ok && me.data?.user);
  } catch (_) {}
  await reload();
})();
