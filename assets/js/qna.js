/* =============================================================
 * FinEdu — 학습 Q&A 게시판 (/qna.html)
 * ============================================================= */

import { api } from "./api.js";

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const CATS = [
  { key: "all",     label: "전체" },
  { key: "general", label: "일반" },
  { key: "stock",   label: "경제" },
  { key: "market",  label: "시장" },
  { key: "basics",  label: "기초" },
  { key: "macro",   label: "거시" },
  { key: "asset",   label: "금융" },
  { key: "tax",     label: "세금·연금" },
];

const state = {
  page: 1,
  sort: "recent",
  category: "all",
  query: "",
  loggedIn: false,
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
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

function catLabel(key) {
  return CATS.find((c) => c.key === key)?.label ?? key;
}

function renderCats() {
  $("#qna-cats").innerHTML = CATS.map((c) => `
    <button class="qna-cat ${c.key === state.category ? "is-active" : ""}" data-cat="${c.key}" type="button" role="tab">
      ${c.label}
    </button>
  `).join("");
  $$("#qna-cats .qna-cat").forEach((b) => {
    b.addEventListener("click", () => {
      state.category = b.dataset.cat;
      state.page = 1;
      load();
    });
  });
}

function renderList(items) {
  const host = $("#qna-list");
  if (items.length === 0) {
    host.innerHTML = `<div class="qna-empty">
      <p>이 조건에 맞는 질문이 없어요. 첫 질문을 남겨보세요!</p>
    </div>`;
    return;
  }
  host.innerHTML = items.map((p) => `
    <article class="qna-row" data-id="${p.id}">
      <span class="qna-row__cat qna-row__cat--${p.category}">${esc(catLabel(p.category))}</span>
      <div class="qna-row__body">
        <h3 class="qna-row__title">
          <a href="/qna_post.html?id=${p.id}">${esc(p.title)}</a>
        </h3>
        <p class="qna-row__preview">${esc(p.body)}</p>
        <div class="qna-row__meta">
          <span>@${esc(p.author.username)}</span>
          <span>·</span>
          <span>${relDate(p.created_at)}</span>
        </div>
      </div>
      <div class="qna-row__count" title="답글 수">${p.reply_count}</div>
    </article>
  `).join("");
}

function renderPagination(page, totalPages) {
  const host = $("#qna-pagination");
  if (totalPages <= 1) { host.innerHTML = ""; return; }
  const btn = (label, p, dis = false, act = false) =>
    `<button class="terms-page ${act ? "is-active" : ""}" type="button" data-page="${p}" ${dis ? "disabled" : ""}>${label}</button>`;
  const pages = [];
  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
  else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }
  host.innerHTML = `
    <nav class="terms-pagination" aria-label="페이지">
      ${btn("‹", page - 1, page === 1)}
      ${pages.map((p) => typeof p === "number" ? btn(String(p), p, false, p === page) : `<span class="terms-page terms-page--ellipsis">${p}</span>`).join("")}
      ${btn("›", page + 1, page === totalPages)}
    </nav>
  `;
  host.querySelectorAll(".terms-page:not(.terms-page--ellipsis)").forEach((b) => {
    if (b.disabled) return;
    b.addEventListener("click", () => {
      const p = Number(b.dataset.page);
      if (!p || p === state.page) return;
      state.page = p;
      load(true);
    });
  });
}

async function load(scrollTop = false) {
  const params = new URLSearchParams({
    page: String(state.page),
    sort: state.sort,
    category: state.category,
  });
  if (state.query) params.set("q", state.query);
  const res = await api.get(`/qna/list.php?${params}`);
  if (!res.ok) { window.toast?.(res.error || "불러오기 실패", { variant: "danger" }); return; }

  $("#qna-count").textContent = res.data.total > 0
    ? `${res.data.total}개 중 ${(state.page-1)*res.data.page_size + 1}–${Math.min(state.page*res.data.page_size, res.data.total)}`
    : "";
  renderList(res.data.items);
  renderPagination(state.page, res.data.total_pages);

  if (scrollTop) $("#qna-list").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* -------------------------------------------------------------
 * 새 글 / 수정 모달
 * ------------------------------------------------------------- */
function openEditor({ id = null, category = "general", title = "", body = "" } = {}) {
  if (!state.loggedIn) {
    window.location.href = "/login.html";
    return;
  }
  const isEdit = !!id;
  const host = $("#qna-modal-host");
  host.innerHTML = `
    <div class="qna-modal-host">
      <div class="qna-modal" role="dialog" aria-modal="true">
        <header class="qna-modal__head">
          <h2>${isEdit ? "질문 수정" : "새 질문"}</h2>
          <button class="qna-modal__close" type="button" aria-label="닫기">✕</button>
        </header>
        <form id="qna-form" class="qna-form">
          <div class="field">
            <label class="field__label" for="qf-cat">카테고리</label>
            <select id="qf-cat" class="select">
              ${CATS.filter(c => c.key !== "all").map((c) =>
                `<option value="${c.key}" ${c.key === category ? "selected" : ""}>${c.label}</option>`
              ).join("")}
            </select>
          </div>
          <div class="field">
            <label class="field__label" for="qf-title">제목</label>
            <input id="qf-title" class="input" type="text" maxlength="200" required value="${esc(title)}" />
          </div>
          <div class="field">
            <label class="field__label" for="qf-body">본문</label>
            <textarea id="qf-body" class="textarea" rows="8" maxlength="10000" required>${esc(body)}</textarea>
            <span class="field__hint">2~10,000자. URL은 자동으로 링크됩니다.</span>
          </div>
          <div class="qna-form__actions">
            <button type="button" class="btn btn--ghost btn--sm" id="qf-cancel">취소</button>
            <button type="submit" class="btn">${isEdit ? "수정 저장" : "질문 등록"}</button>
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

  $("#qna-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const cat   = $("#qf-cat").value;
    const t     = $("#qf-title").value.trim();
    const b     = $("#qf-body").value.trim();
    if (t.length < 2 || b.length < 2) {
      window.toast?.("제목과 본문은 2자 이상.", { variant: "danger" });
      return;
    }
    const submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    const args = { category: cat, title: t, body: b };
    if (isEdit) args.id = id;
    const url = isEdit ? "/qna/update.php" : "/qna/create.php";
    const res = await api.post(url, args);
    submitBtn.disabled = false;
    if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
    window.toast?.(isEdit ? "수정 완료" : "질문 등록 완료!", { variant: "success" });
    close();
    if (!isEdit && res.data?.id) {
      window.location.href = `/qna_post.html?id=${res.data.id}`;
    } else {
      load();
    }
  });
}

/* -------------------------------------------------------------
 * 초기화
 * ------------------------------------------------------------- */
$("#qna-sort").addEventListener("change", (e) => {
  state.sort = e.target.value;
  state.page = 1;
  load();
});
$("#qna-search").addEventListener("input", (e) => {
  state.query = e.target.value.trim();
  state.page = 1;
  // 디바운스
  clearTimeout(window._qnaSearchTimer);
  window._qnaSearchTimer = setTimeout(load, 250);
});
$("#qna-new-btn").addEventListener("click", () => openEditor());

(async function init() {
  renderCats();
  try {
    const me = await api.get("/auth/me.php");
    state.loggedIn = !!(me.ok && me.data?.user);
  } catch (_) {}
  load();
})();
