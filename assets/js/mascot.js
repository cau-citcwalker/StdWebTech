/* =============================================================
 * FinEdu — 아바타 컴포저 (combo-lookup v10)
 *
 *   buildMascotSvg({ equipped, items, size = 360 })
 *   renderMascotInto(el, opts)
 *
 *   슬롯 (각 3종): hair · top · bottom
 *     슬러그 규약: hair-N / top-N / bottom-N  (N = 1..3)
 *
 *   장착 조합을 조회해서 미리 만들어둔 풀바디 합성 PNG 1장을 렌더.
 *     /assets/img/items/combos/hair{H}+top{T}+pants{P}.png   (3슬롯 다 장착)
 *     /assets/img/items/combos/hair{H}+top{T}.png            (하의 미장착)
 *     /assets/img/items/combos/hair{H}+pants{P}.png          (상의 미장착)
 *
 *   (현재 시점) hair1 만 모든 조합 존재. hair2/hair3 는 +top 또는 +pants 페어만 존재.
 *   누락 조합은 가장 가까운 페어로 fallback. 모두 실패하면 character-base.png.
 *
 *   ViewBox 0 0 400 600. 합성 PNG 는 600x900 (1.5x retina) 으로 미리 압축됨.
 * ============================================================= */

const BASE_IMAGE_HREF = "/assets/img/character-base.png";
const COMBOS_DIR = "/assets/img/items/combos";

// 파일명은 "pants" 사용 (bottom 슬롯의 별칭).
const FILE_KEY_BY_SLOT = { hair: "hair", top: "top", bottom: "pants" };

function indexFromSlug(slug) {
  if (!slug) return null;
  const m = /-(\d+)$/.exec(slug);
  return m ? Number(m[1]) : null;
}

/**
 * 장착된 슬롯의 인덱스 셋으로부터 PNG 경로를 조회. fallback 체인 포함.
 */
function comboHref(idx) {
  const { hair, top, bottom } = idx;
  // hair 없으면 합성 PNG 도 없음 — 기본 캐릭터.
  if (!hair) return BASE_IMAGE_HREF;

  const join = (parts) => `${COMBOS_DIR}/${parts.join("+")}.png`;

  if (top && bottom) {
    // 1순위: 풀 트리플
    return join([`hair${hair}`, `top${top}`, `pants${bottom}`]);
  }
  if (top) {
    return join([`hair${hair}`, `top${top}`]);
  }
  if (bottom) {
    return join([`hair${hair}`, `pants${bottom}`]);
  }
  // hair 만 — 사용 가능 PNG 없음. base 로 fallback.
  return BASE_IMAGE_HREF;
}

function imageEl(href) {
  // Safari 옛 버전 대비로 xlink:href 도 같이 박는다.
  return `<image href="${href}" xlink:href="${href}"
                 x="0" y="0" width="400" height="600"
                 preserveAspectRatio="xMidYMid meet"/>`;
}

/**
 * @param {{ equipped?: Object, items?: Array, size?: number, withWrapper?: boolean }} opts
 * @returns {string} SVG markup
 */
export function buildMascotSvg({ equipped = {}, items = [], size = 360, withWrapper = true } = {}) {
  const itemsById = new Map((items || []).map((it) => [Number(it.id), it]));
  const slugFor = (slotKey) => {
    const id = equipped[slotKey];
    if (!id) return null;
    const it = itemsById.get(Number(id));
    return it?.slug ?? null;
  };

  // bottom 슬롯의 슬러그가 "hair-bald" 같이 sentinel 이면 미장착 취급.
  // (실제 sentinel 은 hair-bald 만 — bottom/top 에는 없음.)
  const hairSlug   = slugFor("hair");
  const topSlug    = slugFor("top");
  const bottomSlug = slugFor("bottom");

  const idx = {
    hair:   hairSlug === "hair-bald" ? null : indexFromSlug(hairSlug),
    top:    indexFromSlug(topSlug),
    bottom: indexFromSlug(bottomSlug),
  };

  const body = imageEl(comboHref(idx));
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
