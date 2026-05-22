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
