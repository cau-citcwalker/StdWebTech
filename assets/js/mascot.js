/* =============================================================
 * FinEdu — 아바타 컴포저 (휴머노이드 chibi v8 — Safari-safe)
 *
 *   buildMascotSvg({ equipped, items, size = 360 })
 *   renderMascotInto(el, opts)
 *
 *   슬롯: outfit · hair
 *     outfit (전신 painterly PNG, 투명 배경) → /assets/img/items/outfit/{slug}.png
 *     hair   (전신 PNG, clipPath 로 상단만)  → /assets/img/items/hair/{slug}.png
 *
 *   레이어 순서 (뒤 → 앞): outfit → hair
 *
 *   PNG 4 모서리는 PIL flood-fill 로 alpha 0 (배경 완전 투명). 캐릭터 내부의
 *   흰 옷은 corner 와 연결 안 돼서 솔리드 흰색으로 유지됨.
 *
 *   hair PNG 는 풀바디 그림(흰 옷 baked-in)이라 상단 40%만 보여야 outfit body
 *   가 그대로 노출된다. CSS `clip-path: inset(...)` 은 Safari 가 SVG <image>
 *   에 잘 안 먹혀서, SVG 네이티브 <clipPath> 로 교체.
 *
 *   <image> 의 href 도 Safari 호환을 위해 xlink:href 와 함께 양쪽 다 채움.
 *
 *   hair-bald 슬러그는 "민머리" 시드 sentinel — PNG 파일 없으므로 렌더 스킵.
 *
 *   outfit 미장착 시 character-base.png (기본 bald + 흰옷) 가 fallback.
 *   ViewBox 0 0 400 600.
 * ============================================================= */

const BASE_IMAGE_HREF = "/assets/img/character-base.png";
const HAIR_CLIP_ID = "finedu-hair-clip";

function imageEl(href) {
  // Safari 옛 버전 대비로 xlink:href 도 같이 박는다.
  return `<image href="${href}" xlink:href="${href}"
                 x="0" y="0" width="400" height="600"
                 preserveAspectRatio="xMidYMid meet"/>`;
}

function outfitLayer(item) {
  const href = item?.slug
    ? `/assets/img/items/outfit/${item.slug}.png`
    : BASE_IMAGE_HREF;
  return imageEl(href);
}

function hairLayer(item) {
  if (!item?.slug) return "";
  if (item.slug === "hair-bald") return ""; // 민머리는 렌더 안 함
  const href = `/assets/img/items/hair/${item.slug}.png`;
  // SVG-native clipPath 로 viewBox 상단 40% (y 0..240) 만 노출
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
  const outfitItem = equipped.outfit ? itemsById.get(Number(equipped.outfit)) : null;
  const hairItem   = equipped.hair   ? itemsById.get(Number(equipped.hair))   : null;

  // hair clip 범위: y=0..360 — 정수리부터 턱 + 약간의 목까지 포함.
  // (이전 240 은 hair 별로 살짝 다른 chin 위치 때문에 일부 머리스타일에서 턱이 잘렸음.)
  // hair PNG 의 body(흰 탱크탑) 가 outfit body 와 좌표 정렬이 비슷해서 turtle-neck
  // 부분만 살짝 겹치는 정도는 시각적으로 큰 차이가 안 남.
  const defs = `
    <defs>
      <clipPath id="${HAIR_CLIP_ID}">
        <rect x="0" y="0" width="400" height="360"/>
      </clipPath>
    </defs>
  `;

  const body = defs + outfitLayer(outfitItem) + hairLayer(hairItem);
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
