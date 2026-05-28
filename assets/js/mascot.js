/* =============================================================
 * FinEdu — 아바타 컴포저 (휴머노이드 chibi v6)
 *
 *   buildMascotSvg({ equipped, items, size = 360 })
 *   renderMascotInto(el, opts)
 *
 *   슬롯: outfit · hair
 *     outfit (전신 painterly JPEG)  → /assets/img/items/outfit/{slug}.jpeg
 *     hair   (전신 JPEG, 머리 부분만) → /assets/img/items/hair/{slug}.jpeg
 *
 *   레이어 순서 (뒤 → 앞): outfit → hair
 *
 *   hair JPEG 는 사실 base + 머리스타일이 통째로 그려진 풀바디 이미지라서,
 *   머리 위쪽만 보이게 clip-path 로 잘라내고 mix-blend-mode: multiply 로
 *   흰 배경을 underlying outfit 에 통과시킨다. (JPEG 라서 alpha 채널이 없음)
 *
 *   outfit 이 비어 있을 땐 character-base.jpeg (기본 흰옷 + bald) 가 fallback.
 *   ensure_starter_items 가 starter outfit 을 자동 장착해주므로 평상시엔 거의 안 보임.
 *
 *   ViewBox 0 0 400 600 — JPEG portrait (~0.44) 이라 fit-meet 으로 가운데 정렬.
 * ============================================================= */

const BASE_IMAGE_HREF = "/assets/img/character-base.jpeg";

function outfitLayer(item) {
  const href = item?.slug
    ? `/assets/img/items/outfit/${item.slug}.jpeg`
    : BASE_IMAGE_HREF;
  return `<image href="${href}" x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid meet"/>`;
}

function hairLayer(item) {
  if (!item?.slug) return "";
  // 윗부분(머리 + 약간의 얼굴) 만 보이게 잘라내고, 흰 배경은 multiply 로 통과.
  return `<image href="/assets/img/items/hair/${item.slug}.jpeg"
                 x="0" y="0" width="400" height="600"
                 preserveAspectRatio="xMidYMid meet"
                 style="clip-path: inset(0 0 60% 0); mix-blend-mode: multiply"/>`;
}

/**
 * @param {{ equipped?: Object, items?: Array, size?: number, withWrapper?: boolean }} opts
 * @returns {string} SVG markup
 */
export function buildMascotSvg({ equipped = {}, items = [], size = 360, withWrapper = true } = {}) {
  const itemsById = new Map((items || []).map((it) => [Number(it.id), it]));
  const outfitItem = equipped.outfit ? itemsById.get(Number(equipped.outfit)) : null;
  const hairItem   = equipped.hair   ? itemsById.get(Number(equipped.hair))   : null;

  const body = outfitLayer(outfitItem) + hairLayer(hairItem);
  if (!withWrapper) return body;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"
         width="${size}" height="${Math.round(size * 1.5)}"
         role="img" aria-label="내 캐릭터">
      ${body}
    </svg>
  `;
}

/**
 * 주어진 컨테이너 엘리먼트 안에 아바타를 렌더한다 (덮어쓰기).
 */
export function renderMascotInto(el, opts) {
  if (!el) return;
  el.innerHTML = buildMascotSvg(opts);
}
