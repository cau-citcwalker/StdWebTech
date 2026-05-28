/* =============================================================
 * FinEdu — 아바타 아이템 SVG 로더
 *
 *   loadItemAssets(items)   : 카탈로그에 있는 모든 아이템의 SVG 를 병렬로 받아 메모리에 캐싱
 *   getItemSvg(slug)        : 캐시된 SVG fragment 문자열 반환 (없으면 빈 문자열)
 *
 *   파일 위치 규칙:
 *     /assets/img/items/{slot}/{slug}.svg
 *
 *   각 SVG 파일은 <svg> 래퍼 없이 fragment (<g>...</g> 또는 <path .../>) 만 담는다.
 *   mascot.js 가 슬롯별 fragment 를 합쳐 최종 <svg> 를 생성한다.
 * ============================================================= */

const cache = new Map();
let loaded = false;

/**
 * @param {Array<{slug:string, slot:string}>} items
 */
export async function loadItemAssets(items) {
  if (loaded) return;
  const targets = (items || [])
    .filter((it) => it && it.slug && it.slot)
    .map((it) => ({ slug: it.slug, slot: it.slot }));

  await Promise.all(targets.map(async ({ slug, slot }) => {
    if (cache.has(slug)) return;
    try {
      const res = await fetch(`/assets/img/items/${slot}/${slug}.svg`, {
        cache: "force-cache",
      });
      if (!res.ok) {
        cache.set(slug, "");
        return;
      }
      const text = await res.text();
      cache.set(slug, text.trim());
    } catch (_) {
      cache.set(slug, "");
    }
  }));

  loaded = true;
}

export function getItemSvg(slug) {
  if (!slug) return "";
  return cache.get(slug) ?? "";
}
