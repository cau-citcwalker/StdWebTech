/* =============================================================
 * FinEdu — 아바타 컴포저 (휴머노이드 chibi v7 — PNG · 투명 배경)
 *
 *   buildMascotSvg({ equipped, items, size = 360 })
 *   renderMascotInto(el, opts)
 *
 *   슬롯: outfit · hair
 *     outfit (전신 painterly PNG, 투명 배경) → /assets/img/items/outfit/{slug}.png
 *     hair   (전신 PNG, clip 으로 상단만)     → /assets/img/items/hair/{slug}.png
 *
 *   레이어 순서 (뒤 → 앞): outfit → hair
 *
 *   모든 캐릭터 PNG 는 PIL 로 corner flood-fill 해서 배경 흰색을 alpha 0 으로 빼둠.
 *   덕분에 mix-blend-mode 같은 트릭 없이도 캐릭터 외곽이 깔끔하게 떠 있는다.
 *   hair PNG 는 풀바디 그림이라 clip-path 로 상단 40%만 보이게 잘라낸다.
 *
 *   outfit 미장착 시 character-base.png (기본 bald + 흰옷) 가 fallback.
 *
 *   ViewBox 0 0 400 600 — PNG portrait 가 fit-meet 으로 가운데 정렬.
 * ============================================================= */

const BASE_IMAGE_HREF = "/assets/img/character-base.png";

function outfitLayer(item) {
  const href = item?.slug
    ? `/assets/img/items/outfit/${item.slug}.png`
    : BASE_IMAGE_HREF;
  return `<image href="${href}" x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid meet"/>`;
}

function hairLayer(item) {
  if (!item?.slug) return "";
  // hair PNG 도 풀바디. 머리 + 약간의 얼굴만 보이게 상단 40% 로 자른다.
  return `<image href="/assets/img/items/hair/${item.slug}.png"
                 x="0" y="0" width="400" height="600"
                 preserveAspectRatio="xMidYMid meet"
                 style="clip-path: inset(0 0 60% 0)"/>`;
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
