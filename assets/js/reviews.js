/* =============================================================
 * FinEdu — 사용자 리뷰 (/reviews.html)
 * ============================================================= */

import { api } from "./api.js";

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const state = {
  page: 1,
  sort: "recent",
  filter: new Set(),   // 1..5 별점
  data: null,
  loggedIn: false,
  user: null,
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

function escMultiline(s) {
  // URL 자동 링크 + 줄바꿈 보존. 이모지는 native 로 그대로 통과.
  const html = esc(s).replace(
    /\bhttps?:\/\/[^\s<]+/g,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">🔗 ${url}</a>`
  );
  return html.replace(/\n/g, "<br>");
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

function starsRow(n, { interactive = false } = {}) {
  return [1,2,3,4,5].map((i) =>
    `<span class="star ${interactive ? "star--btn" : ""} ${i <= n ? "is-on" : ""}" data-val="${i}">${i <= n ? "★" : "☆"}</span>`
  ).join("");
}

function avatarFromName(name) {
  return (name || "?").trim().slice(0, 1);
}

/* -------------------------------------------------------------
 * 통계 헤더
 * ------------------------------------------------------------- */
function renderStats(stats) {
  const total = stats.count;
  if (total === 0) {
    $("#reviews-stats").innerHTML = `<p class="reviews-stats__empty">아직 리뷰가 없어요. 첫 리뷰를 남겨주세요!</p>`;
    return;
  }
  const avg = stats.average.toFixed(2);
  const distHtml = [5,4,3,2,1].map((r) => {
    const n = stats.distribution[String(r)] || 0;
    const pct = total ? Math.round(n / total * 100) : 0;
    return `
      <button class="dist-row ${state.filter.has(r) ? "is-active" : ""}" type="button" data-rating="${r}" title="${r}점만 보기">
        <span class="dist-row__label">${r}★</span>
        <span class="dist-row__bar"><span style="width:${pct}%"></span></span>
        <span class="dist-row__num">${n}</span>
      </button>
    `;
  }).join("");
  $("#reviews-stats").innerHTML = `
    <div class="reviews-stats__avg">
      <div class="reviews-stats__avg-num">${avg}</div>
      <div class="reviews-stats__avg-stars">${starsRow(Math.round(stats.average))}</div>
      <div class="reviews-stats__avg-count">${total}개의 리뷰</div>
    </div>
    <div class="reviews-stats__dist">${distHtml}</div>
  `;
  $$("#reviews-stats .dist-row").forEach((b) => {
    b.addEventListener("click", () => {
      const r = Number(b.dataset.rating);
      if (state.filter.has(r)) state.filter.delete(r); else state.filter.add(r);
      state.page = 1;
      load();
    });
  });
}

/* -------------------------------------------------------------
 * 별점 필터 chips
 * ------------------------------------------------------------- */
function renderFilterChips() {
  const host = $("#filter-chips");
  const all = [5,4,3,2,1];
  host.innerHTML = `
    <button class="chip ${state.filter.size === 0 ? "is-active" : ""}" data-rating="all" type="button">전체</button>
    ${all.map((r) => `
      <button class="chip ${state.filter.has(r) ? "is-active" : ""}" data-rating="${r}" type="button">${r}★</button>
    `).join("")}
  `;
  host.querySelectorAll(".chip").forEach((c) => {
    c.addEventListener("click", () => {
      const v = c.dataset.rating;
      if (v === "all") state.filter.clear();
      else {
        const n = Number(v);
        if (state.filter.has(n)) state.filter.delete(n);
        else state.filter.add(n);
      }
      state.page = 1;
      load();
    });
  });
}

/* -------------------------------------------------------------
 * 내 리뷰 영역 — 있으면 카드 + 수정/삭제, 없으면 작성 폼
 * ------------------------------------------------------------- */
function renderMy(my) {
  const host = $("#my-review-section");
  if (!state.loggedIn) {
    host.innerHTML = `
      <div class="my-review__login">
        <p>리뷰를 남기려면 <a href="/login.html">로그인</a> 해주세요. 계정이 없으면 <a href="/signup.html">가입</a>도 가능.</p>
      </div>
    `;
    return;
  }
  if (my) {
    host.innerHTML = `
      <article class="review-card review-card--mine">
        <header class="review-card__head">
          <div class="review-card__author">
            <span class="review-card__avatar">${esc(avatarFromName(my.author.display_name))}</span>
            <div>
              <div class="review-card__name">${esc(my.author.display_name)} <span class="badge badge--brand">내 리뷰</span></div>
              <div class="review-card__handle">@${esc(my.author.username)}</div>
            </div>
          </div>
          <div class="review-card__stars">${starsRow(my.rating)}</div>
        </header>
        <p class="review-card__body">${escMultiline(my.body)}</p>
        <footer class="review-card__foot">
          <span class="review-card__time">${relDate(my.created_at)}${my.updated_at ? " · 수정됨" : ""}</span>
          <div class="review-card__actions">
            <button class="btn btn--secondary btn--sm" id="my-edit" type="button">수정</button>
            <button class="btn btn--ghost btn--sm" id="my-delete" type="button">삭제</button>
          </div>
        </footer>
      </article>
    `;
    $("#my-edit").addEventListener("click", () => renderForm(my));
    $("#my-delete").addEventListener("click", async () => {
      if (!confirm("내 리뷰를 삭제할까요?")) return;
      const res = await api.post("/reviews/delete.php", { id: my.id });
      if (!res.ok) { window.toast?.(res.error || "삭제 실패", { variant:"danger" }); return; }
      window.toast?.("리뷰를 삭제했어요.");
      load();
    });
  } else {
    renderForm(null);
  }
}

function renderForm(editTarget /* my object or null = create */) {
  const host = $("#my-review-section");
  const isEdit = !!editTarget;
  host.innerHTML = `
    <form id="my-review-form" class="my-review__form">
      <h2 class="my-review__title">${isEdit ? "리뷰 수정" : "내 리뷰 남기기"}</h2>
      <p class="my-review__hint">FinEdu 를 써본 솔직한 후기를 들려주세요. 다른 학습자에게 큰 도움이 돼요.</p>
      <div class="my-review__rating" role="group" aria-label="별점">
        ${[1,2,3,4,5].map((i) =>
          `<button type="button" class="star star--btn ${editTarget && i <= editTarget.rating ? "is-on" : ""}" data-val="${i}">${editTarget && i <= editTarget.rating ? "★" : "☆"}</button>`
        ).join("")}
        <span id="my-review-rating-label" class="my-review__rating-label">${editTarget?.rating ? editTarget.rating + "점" : "별점을 골라주세요"}</span>
      </div>
      <textarea id="my-review-body" class="textarea" rows="5"
                placeholder="예) 5분이면 한 레슨이라 부담 없이 매일 들어와요. 캐릭터 꾸미는 재미도 있고요. 😊"
                maxlength="2000">${editTarget ? esc(editTarget.body) : ""}</textarea>
      <div class="my-review__actions">
        ${isEdit ? `<button type="button" class="btn btn--ghost btn--sm" id="my-cancel">취소</button>` : ""}
        <button type="submit" class="btn">${isEdit ? "수정 저장" : "리뷰 등록"}</button>
      </div>
    </form>
  `;
  let rating = editTarget?.rating || 0;

  const stars = $$("#my-review-section .star--btn");
  const ratingLabel = $("#my-review-rating-label");
  stars.forEach((s) => {
    s.addEventListener("click", () => {
      rating = Number(s.dataset.val);
      stars.forEach((x, idx) => {
        const on = idx + 1 <= rating;
        x.classList.toggle("is-on", on);
        x.textContent = on ? "★" : "☆";
      });
      ratingLabel.textContent = rating + "점";
    });
    s.addEventListener("mouseover", () => {
      const hov = Number(s.dataset.val);
      stars.forEach((x, idx) => x.textContent = (idx + 1 <= hov ? "★" : "☆"));
    });
    s.addEventListener("mouseout", () => {
      stars.forEach((x, idx) => x.textContent = (idx + 1 <= rating ? "★" : "☆"));
    });
  });

  if (isEdit) {
    $("#my-cancel").addEventListener("click", () => renderMy(editTarget));
  }

  $("#my-review-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = $("#my-review-body").value.trim();
    if (rating < 1) { window.toast?.("별점을 골라주세요.", { variant: "danger" }); return; }
    if (body.length < 2) { window.toast?.("내용을 2자 이상 입력해 주세요.", { variant: "danger" }); return; }
    const url  = isEdit ? "/reviews/update.php" : "/reviews/create.php";
    const args = isEdit ? { id: editTarget.id, rating, body } : { rating, body };
    const submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    const res = await api.post(url, args);
    submitBtn.disabled = false;
    if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
    window.toast?.(isEdit ? "리뷰가 수정됐어요." : "리뷰 등록 완료. 감사합니다!", { variant: "success" });
    load();
  });
}

/* -------------------------------------------------------------
 * 리스트
 * ------------------------------------------------------------- */
function renderList(items) {
  const host = $("#reviews-list");
  if (items.length === 0) {
    host.innerHTML = `<div class="reviews-empty"><p>이 필터에 해당하는 리뷰가 없어요.</p></div>`;
    return;
  }
  host.innerHTML = items.map((r) => `
    <article class="review-card ${r.is_mine ? "review-card--mine" : ""}" data-id="${r.id}">
      <header class="review-card__head">
        <div class="review-card__author">
          <span class="review-card__avatar">${esc(avatarFromName(r.author.display_name))}</span>
          <div>
            <div class="review-card__name">${esc(r.author.display_name)}${r.is_mine ? ` <span class="badge badge--brand">내 리뷰</span>` : ""}</div>
            <div class="review-card__handle">@${esc(r.author.username)}</div>
          </div>
        </div>
        <div class="review-card__stars">${starsRow(r.rating)}</div>
      </header>
      <p class="review-card__body">${escMultiline(r.body)}</p>
      <footer class="review-card__foot">
        <span class="review-card__time">${relDate(r.created_at)}${r.updated_at ? " · 수정됨" : ""}</span>
        ${renderLikeBtn(r)}
      </footer>
    </article>
  `).join("");

  host.querySelectorAll(".review-like").forEach((btn) => {
    btn.addEventListener("click", () => toggleLike(btn));
  });
}

function renderLikeBtn(r) {
  // 본인 리뷰엔 좋아요 X. 비로그인은 count만 표시 (클릭 시 로그인 유도).
  if (r.is_mine) {
    return `<span class="review-like review-like--readonly">👍 ${r.like_count}</span>`;
  }
  if (!state.loggedIn) {
    return `<a class="review-like review-like--readonly" href="/login.html" title="로그인 후 좋아요">👍 ${r.like_count}</a>`;
  }
  return `<button type="button"
                  class="review-like ${r.i_liked ? "is-on" : ""}"
                  data-id="${r.id}"
                  data-liked="${r.i_liked ? "1" : "0"}"
                  aria-pressed="${r.i_liked ? "true" : "false"}">
            <span class="review-like__icon">${r.i_liked ? "👍" : "👍🏻"}</span>
            <span class="review-like__count">${r.like_count}</span>
            <span class="review-like__label">유용해요</span>
          </button>`;
}

async function toggleLike(btn) {
  const id = Number(btn.dataset.id);
  btn.disabled = true;
  const res = await api.post("/reviews/like_toggle.php", { id });
  btn.disabled = false;
  if (!res.ok) { window.toast?.(res.error || "실패", { variant: "danger" }); return; }
  const liked = !!res.data?.liked;
  btn.dataset.liked = liked ? "1" : "0";
  btn.classList.toggle("is-on", liked);
  btn.setAttribute("aria-pressed", liked ? "true" : "false");
  btn.querySelector(".review-like__count").textContent = res.data.like_count;
  btn.querySelector(".review-like__icon").textContent = liked ? "👍" : "👍🏻";
}

function renderPagination(page, totalPages) {
  const host = $("#reviews-pagination");
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

/* -------------------------------------------------------------
 * 로드
 * ------------------------------------------------------------- */
async function load(scrollTop = false) {
  const params = new URLSearchParams({
    page: String(state.page),
    sort: state.sort,
  });
  if (state.filter.size > 0) params.set("filter", Array.from(state.filter).join(","));
  const res = await api.get(`/reviews/list.php?${params}`);
  if (!res.ok) { window.toast?.(res.error || "불러오기 실패", { variant: "danger" }); return; }
  state.data = res.data;

  renderStats(res.data.stats);
  renderFilterChips();
  renderMy(res.data.my);

  $("#reviews-count").textContent = res.data.total > 0
    ? `${res.data.total}개 중 ${(state.page-1)*res.data.page_size + 1}–${Math.min(state.page*res.data.page_size, res.data.total)}`
    : "";
  renderList(res.data.items);
  renderPagination(state.page, res.data.total_pages);

  if (scrollTop) $("#reviews-list").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* -------------------------------------------------------------
 * 초기화
 * ------------------------------------------------------------- */
$("#sort-select").addEventListener("change", (e) => {
  state.sort = e.target.value;
  state.page = 1;
  load();
});

(async function init() {
  try {
    const me = await api.get("/auth/me.php");
    if (me.ok && me.data?.user) {
      state.loggedIn = true;
      state.user = me.data.user;
    }
  } catch (_) {}
  load();
})();
