/* =============================================================
 * FinEdu — 아바타 컴포저 (휴머노이드 chibi v9 — 3-slot)
 *
 *   buildMascotSvg({ equipped, items, size = 360 })
 *   renderMascotInto(el, opts)
 *
 *   슬롯 (뒤 → 앞 레이어 순서): bottom → top → hair
 *     bottom (하의 PNG, 전신 frame) → /assets/img/items/bottom/{slug}.png
 *     top    (상의 PNG, 전신 frame) → /assets/img/items/top/{slug}.png
 *     hair   (헤어 PNG, clipPath 로 상단만 노출) → /assets/img/items/hair/{slug}.png
 *
 *   모든 PNG 는 viewBox 0 0 400 600 기준 전신 frame, 배경 alpha 0 이어야 함.
 *   각 슬롯이 비어있어도 (item 미장착) base 캐릭터(bald + 맨몸)는 항상 깔린다.
 *
 *   hair PNG 는 전신 그림이라 상단(y=0..360) 만 clip 으로 노출.
 *   hair-bald 슬러그는 "민머리" sentinel — PNG 파일 없으므로 렌더 스킵.
 *
 *   <image> 의 href 는 Safari 호환을 위해 xlink:href 와 함께 양쪽 다 채움.
 * ============================================================= */

const BASE_IMAGE_HREF = "/assets/img/character-base.png";
const HAIR_CLIP_ID = "finedu-hair-clip";

function imageEl(href) {
  // Safari 옛 버전 대비로 xlink:href 도 같이 박는다.
  return `<image href="${href}" xlink:href="${href}"
                 x="0" y="0" width="400" height="600"
                 preserveAspectRatio="xMidYMid meet"/>`;
}

function baseLayer() {
  return imageEl(BASE_IMAGE_HREF);
}

function slotLayer(slot, item) {
  if (!item?.slug) return "";
  return imageEl(`/assets/img/items/${slot}/${item.slug}.png`);
}

function hairLayer(item) {
  if (!item?.slug) return "";
  if (item.slug === "hair-bald") return ""; // 민머리는 렌더 안 함
  const href = `/assets/img/items/hair/${item.slug}.png`;
  // SVG-native clipPath 로 viewBox 상단(y 0..360)만 노출 — body 영역은 top 이 그림.
  return `<image href="${href}" xlink:href="${href}"
                 x="0" y="0" width="400" height="600"
                 preserveAspectRatio="xMidYMid meet"
                 clip-path="url(#${HAIR_CLIP_ID})"/>`;
}

/**
 * @param {{ equipped?: Object, items?: Array, size?: number, withWrapper?: boolean }} opts
 * @returns {string} SVG markup
 */
export function buildMascotSvg({ equipped = {}, items = [], size = 360, withWrapper = true } = {}) {
  const itemsById = new Map((items || []).map((it) => [Number(it.id), it]));
  const bottomItem = equipped.bottom ? itemsById.get(Number(equipped.bottom)) : null;
  const topItem    = equipped.top    ? itemsById.get(Number(equipped.top))    : null;
  const hairItem   = equipped.hair   ? itemsById.get(Number(equipped.hair))   : null;

  const defs = `
    <defs>
      <clipPath id="${HAIR_CLIP_ID}">
        <rect x="0" y="0" width="400" height="360"/>
      </clipPath>
    </defs>
  `;

  // 레이어 순서: 항상 base 깔고 → bottom → top → hair.
  // (어느 슬롯도 비어있을 수 있어서 base 가 fallback 역할.)
  const body = defs
    + baseLayer()
    + slotLayer("bottom", bottomItem)
    + slotLayer("top",    topItem)
    + hairLayer(hairItem);

  if (!withWrapper) return body;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         viewBox="0 0 400 600"
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
