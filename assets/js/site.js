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
