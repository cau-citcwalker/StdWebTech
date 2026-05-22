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

(function initSfxToggle() {
  /**
   * 사운드 토글 버튼을 헤더에 자동 주입. `localStorage.finedu.sound` 와 동기화.
   * (실제 효과음 합성은 sfx.js 가 같은 키를 읽어서 처리)
   */
  const LS_KEY = "finedu.sound";
  const header = document.querySelector(".site-header__inner, .auth-header__inner, .lesson-top__inner");
  if (!header) return;
  if (header.querySelector(".sfx-toggle")) return;

  let on = (() => {
    const v = localStorage.getItem(LS_KEY);
    return v === null ? true : v === "true";
  })();

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sfx-toggle";
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.setAttribute("aria-label", "효과음 켜기/끄기");

  const ICON_ON  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1Z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M19 6a8 8 0 0 1 0 12"/></svg>`;
  const ICON_OFF = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1Z"/><line x1="17" y1="9" x2="23" y2="15"/><line x1="23" y1="9" x2="17" y2="15"/></svg>`;
  const render = () => {
    btn.innerHTML = on ? ICON_ON : ICON_OFF;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  };
  render();

  btn.addEventListener("click", () => {
    on = !on;
    localStorage.setItem(LS_KEY, on ? "true" : "false");
    render();
    if (window.toast) window.toast(on ? "효과음 켰어요" : "효과음 껐어요");
  });

  // 헤더 우측에 자리 잡기
  const actions = header.querySelector(".site-nav__actions");
  if (actions) {
    actions.insertBefore(btn, actions.firstChild);
  } else {
    header.appendChild(btn);
  }
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
