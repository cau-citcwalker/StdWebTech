/* =============================================================
 * FinEdu — 메인 페이지 스크립트
 *
 * 부드러운 앵커 스크롤만 담당. 카운트업 통계나 마스코트 눈동자
 * 추적 같은 데모용 연출은 페이지에서 제거되어 함께 빠졌다.
 * ============================================================= */

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
