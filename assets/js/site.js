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

(function initNotifBell() {
  /**
   * 헤더에 알림 벨 자동 주입.
   * site.js 는 classic script 라 sfx.js 처럼 fetch 직접 사용.
   */
  const actions = document.querySelector(".site-header__inner .site-nav__actions");
  if (!actions) return;          // 보호 안 된 페이지(홈/로그인 등) 에서는 미주입
  if (actions.querySelector(".notif-host")) return;

  const host = document.createElement("div");
  host.className = "notif-host";
  host.innerHTML = `
    <button class="notif-bell" type="button" aria-label="알림">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3 -2 3 -9"/>
        <path d="M10 21a2 2 0 0 0 4 0"/>
      </svg>
      <span class="notif-bell__badge" hidden>0</span>
    </button>
    <div class="notif-dropdown" role="region" aria-label="알림 목록">
      <div class="notif-dropdown__head">
        <span class="notif-dropdown__title">알림</span>
        <button type="button" class="notif-dropdown__readall">모두 읽음</button>
      </div>
      <div class="notif-list">
        <div class="notif-empty"><div class="notif-empty__title">불러오는 중…</div></div>
      </div>
    </div>
  `;
  actions.insertBefore(host, actions.firstChild);

  const bell = host.querySelector(".notif-bell");
  const badge = host.querySelector(".notif-bell__badge");
  const dropdown = host.querySelector(".notif-dropdown");
  const list = host.querySelector(".notif-list");
  const readAllBtn = host.querySelector(".notif-dropdown__readall");

  function rel(iso) {
    if (!iso) return "";
    const t = new Date(iso.replace(" ", "T")).getTime();
    const d = (Date.now() - t) / 1000;
    if (d < 60) return "방금 전";
    if (d < 3600) return Math.floor(d / 60) + "분 전";
    if (d < 86400) return Math.floor(d / 3600) + "시간 전";
    if (d < 86400 * 7) return Math.floor(d / 86400) + "일 전";
    return iso.slice(0, 10);
  }

  function iconFor(type) {
    if (type === "friend_request" || type === "friend_accepted") {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0 -4 -4H6a4 4 0 0 0 -4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11l-3 3l-3 -3"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 14.7 8.6 22 9.3 16.5 14 18.2 21 12 17.3 5.8 21 7.5 14 2 9.3 9.3 8.6Z"/></svg>`;
  }

  function setBadge(n) {
    if (n > 0) {
      badge.textContent = n > 99 ? "99+" : String(n);
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  function render(items) {
    if (!items || items.length === 0) {
      list.innerHTML = `<div class="notif-empty"><div class="notif-empty__title">새 알림이 없어요</div><p>친구 신청이나 시스템 공지가 여기에 표시돼요.</p></div>`;
      return;
    }
    list.innerHTML = items.map((n) => `
      <a class="notif-item notif-item--${n.type} ${n.is_read ? "" : "is-unread"}"
         href="${n.link || "#"}" data-id="${n.id}">
        <div class="notif-item__icon">${iconFor(n.type)}</div>
        <div class="notif-item__body">
          <div class="notif-item__title">${n.title}</div>
          ${n.body ? `<div class="notif-item__sub">${n.body}</div>` : ""}
          <div class="notif-item__time">${rel(n.created_at)}</div>
        </div>
      </a>
    `).join("");

    list.querySelectorAll(".notif-item").forEach((a) => {
      a.addEventListener("click", async (e) => {
        const id = Number(a.dataset.id);
        // 읽음 표시
        await fetch("/api/notifications/read.php", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      });
    });
  }

  async function fetchAll() {
    const res = await fetch("/api/notifications/list.php?limit=30", {
      credentials: "same-origin",
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.data) {
      setBadge(data.data.unread || 0);
      render(data.data.items || []);
    }
  }

  async function fetchUnreadOnly() {
    const res = await fetch("/api/notifications/list.php?limit=1", {
      credentials: "same-origin",
    });
    if (!res.ok) { setBadge(0); return; }
    const data = await res.json();
    setBadge(data?.data?.unread || 0);
  }

  bell.addEventListener("click", async (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle("is-open");
    if (open) await fetchAll();
  });

  document.addEventListener("click", (e) => {
    if (!host.contains(e.target)) dropdown.classList.remove("is-open");
  });

  readAllBtn.addEventListener("click", async () => {
    await fetch("/api/notifications/read.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    await fetchAll();
  });

  // 페이지 진입 시 unread 카운트만 가져옴
  fetchUnreadOnly();
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
