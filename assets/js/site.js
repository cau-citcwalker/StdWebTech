/* =============================================================
 * FinEdu — 사이트 공통 스크립트
 *
 * 모든 페이지에 로드되는 가벼운 글로벌 동작:
 *   - 스크롤 시 헤더에 그림자 부여
 *   - 모바일 네비 토글
 *   - 토스트 헬퍼 (window.toast)
 *   - 진입 애니메이션 (data-anim)
 * ============================================================= */

(function initHeaderShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
})();

(function initMoreDropdown() {
  /** 헤더의 "더보기 ▾" 드롭다운 — 데스크탑에서만 의미 있음 (모바일은 CSS 로 펼침). */
  const btn  = document.querySelector(".site-nav__more-btn");
  const menu = document.querySelector(".site-nav__more-menu");
  if (!btn || !menu) return;
  const close = () => { btn.setAttribute("aria-expanded", "false"); menu.hidden = true; };
  const open  = () => { btn.setAttribute("aria-expanded", "true");  menu.hidden = false; };
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    btn.getAttribute("aria-expanded") === "true" ? close() : open();
  });
  document.addEventListener("click", (e) => {
    if (!btn.parentElement.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

(function initNavActive() {
  /**
   * 헤더 nav 의 link 중 현재 경로와 일치하는 항목에 .is-active 자동 부여.
   * 추가로, 매치된 링크가 "더보기" 드롭다운 안에 있다면 드롭다운 버튼 자체에도
   * .is-active 를 줘서 사용자가 어디 속한 페이지인지 알게 함.
   */
  const path = location.pathname.replace(/\/$/, "") || "/";
  const norm = (p) => (p || "").replace(/\/$/, "") || "/";
  const moreBtn = document.querySelector(".site-nav__more-btn");
  let dropdownActive = false;
  document.querySelectorAll(".site-nav a[href]").forEach((a) => {
    const href = norm(new URL(a.getAttribute("href"), location.origin).pathname);
    const isActive = href === path;
    a.classList.toggle("is-active", isActive);
    if (isActive && a.closest(".site-nav__more-menu")) dropdownActive = true;
  });
  if (moreBtn) moreBtn.classList.toggle("is-active", dropdownActive);
})();

(function initNavToggle() {
  const toggle = document.querySelector(".site-nav__toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest(".site-nav__link")) nav.classList.remove("is-open");
  });
})();

(function initThemeToggle() {
  /**
   * 헤더의 .site-nav__actions 에 다크/라이트 토글 버튼 주입.
   * 초기 테마는 <head> 의 inline theme-init script 가 이미 셋팅함
   * (localStorage 'finedu-theme' || prefers-color-scheme).
   * 여기서는 토글 버튼 + 클릭 핸들러만 담당.
   */
  const actions = document.querySelector(".site-header__inner .site-nav__actions");
  if (!actions || actions.querySelector(".theme-toggle")) return;

  const sun = `<svg class="theme-toggle__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41 -1.41M17.66 6.34l1.41 -1.41"/>
  </svg>`;
  const moon = `<svg class="theme-toggle__moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`;

  const btn = document.createElement("button");
  btn.className = "theme-toggle";
  btn.type = "button";
  btn.setAttribute("aria-label", "테마 전환");
  btn.innerHTML = sun + moon;
  // actions 의 가장 앞에 놓아서 학습계속/로그인 버튼 왼쪽에 자리잡게.
  actions.insertBefore(btn, actions.firstChild);

  btn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("finedu-theme", next); } catch (_) {}
  });
})();

(function initToast() {
  let host = document.querySelector(".toast-host");
  if (!host) {
    host = document.createElement("div");
    host.className = "toast-host";
    document.body.appendChild(host);
  }
  /**
   * window.toast(message, { variant: "success" | "danger" | "default", duration })
   */
  window.toast = (message, { variant = "default", duration = 2400 } = {}) => {
    const el = document.createElement("div");
    el.className = "toast" + (variant !== "default" ? ` toast--${variant}` : "");
    el.textContent = message;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-shown"));
    setTimeout(() => {
      el.classList.remove("is-shown");
      setTimeout(() => el.remove(), 300);
    }, duration);
  };
})();

(async function syncHeaderAuth() {
  /**
   * 헤더의 .site-nav__actions 를 로그인 상태에 맞춰 동기화.
   *   - 로그인 상태:  "학습 계속 / 로그아웃" 으로 무조건 교체
   *                  (메인엔 로그인/회원가입 링크가 있고, 옷장·마켓·프로필
   *                   같은 보호 페이지엔 빈 div 만 있어서 그동안 로그아웃
   *                   버튼이 거기엔 안 떴음.)
   *   - 로그아웃 상태: 손대지 않음 (메인에 있던 로그인/회원가입 그대로)
   */
  const actions = document.querySelector(".site-header__inner .site-nav__actions");
  if (!actions) return;

  let me;
  try {
    const res = await fetch("/api/auth/me.php", { credentials: "same-origin" });
    if (!res.ok) return;
    me = await res.json();
  } catch (_) { return; }

  if (!me?.data?.user) return; // 로그아웃 상태 → 그대로

  actions.innerHTML = `
    <a class="btn btn--secondary btn--sm" href="/learn.html">학습 계속</a>
    <button class="btn btn--ghost btn--sm" id="header-logout" type="button">로그아웃</button>
  `;
  actions.querySelector("#header-logout").addEventListener("click", async () => {
    await fetch("/api/auth/logout.php", { method: "POST", credentials: "same-origin" });
    location.href = "/";
  });
})();

(function initIntersectAnims() {
  const items = document.querySelectorAll("[data-anim]");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
  );
  items.forEach((el) => io.observe(el));
})();
