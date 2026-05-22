/* =============================================================
 * FinEdu — 메인 페이지 스크립트
 *
 * - 통계 숫자 카운트업 (뷰포트에 들어오면 한 번)
 * - 마스코트 마우스 추적 (눈동자가 살짝 따라옴)
 * - 부드러운 앵커 스크롤
 * ============================================================= */

/* -- 통계 카운트업 -------------------------------------------- */
(function initStatCounters() {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;

  const fmt = (n) => n.toLocaleString("ko-KR");

  const animate = (el) => {
    const target = Number(el.dataset.count || 0);
    const duration = 1400;
    const startedAt = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - startedAt) / duration);
      el.firstChild.nodeValue = fmt(Math.round(target * easeOut(t)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    nums.forEach(animate);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  nums.forEach((el) => io.observe(el));
})();

/* -- 마스코트 눈동자 추적 ------------------------------------ */
(function initMascotEyes() {
  const stage = document.querySelector(".hero__stage");
  const mascot = document.querySelector(".hero__mascot svg");
  if (!stage || !mascot) return;

  const leftPupil = mascot.querySelector("[data-eye='left'] [data-pupil]");
  const rightPupil = mascot.querySelector("[data-eye='right'] [data-pupil]");
  if (!leftPupil || !rightPupil) return;

  const lBase = { cx: Number(leftPupil.getAttribute("cx")), cy: Number(leftPupil.getAttribute("cy")) };
  const rBase = { cx: Number(rightPupil.getAttribute("cx")), cy: Number(rightPupil.getAttribute("cy")) };
  const MAX = 4;

  const onMove = (e) => {
    const r = stage.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    const dx = Math.max(-1, Math.min(1, cx * 2));
    const dy = Math.max(-1, Math.min(1, cy * 2));
    leftPupil.setAttribute("cx", String(lBase.cx + dx * MAX));
    leftPupil.setAttribute("cy", String(lBase.cy + dy * MAX));
    rightPupil.setAttribute("cx", String(rBase.cx + dx * MAX));
    rightPupil.setAttribute("cy", String(rBase.cy + dy * MAX));
  };

  const reset = () => {
    leftPupil.setAttribute("cx", String(lBase.cx));
    leftPupil.setAttribute("cy", String(lBase.cy));
    rightPupil.setAttribute("cx", String(rBase.cx));
    rightPupil.setAttribute("cy", String(rBase.cy));
  };

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("blur", reset);
  document.addEventListener("mouseleave", reset);
})();

/* -- 부드러운 앵커 스크롤 ----------------------------------- */
(function initSmoothAnchors() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const headerOffset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  });
})();
