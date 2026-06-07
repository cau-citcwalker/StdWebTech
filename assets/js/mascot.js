/* =============================================================
 * FinEdu — 아바타 컴포저 (combo-lookup v11)
 *
 *   buildMascotSvg({ equipped, items, size = 360 })
 *   renderMascotInto(el, opts)
 *
 *   슬롯 (각 3종): hair · top · bottom
 *     슬러그 규약: hair-N / top-N / bottom-N  (N = 1..3)
 *
 *   장착 조합을 조회해서 미리 만들어둔 합성 PNG 1장을 렌더.
 *     3슬롯 :  /assets/img/items/combos/hair{H}+top{T}+pants{P}.png
 *     2슬롯 :  /assets/img/items/combos/hair{H}+top{T}.png
 *              /assets/img/items/combos/hair{H}+pants{P}.png
 *     1슬롯 :  /assets/img/items/combos/hair{H}.png
 *              /assets/img/items/combos/top{T}.png
 *              /assets/img/items/combos/pants{P}.png
 *     아무것도 미장착 : /assets/img/items/start_avatar.png
 *
 *   ViewBox 0 0 400 600.
 * ============================================================= */

const START_AVATAR_HREF = "/assets/img/items/start_avatar.png";
const COMBOS_DIR = "/assets/img/items/combos";

function indexFromSlug(slug) {
  if (!slug) return null;
  const m = /-(\d+)$/.exec(slug);
  return m ? Number(m[1]) : null;
}

/**
 * 장착된 슬롯의 인덱스 셋으로부터 PNG 경로를 조회.
 * 모든 1·2·3 슬롯 조합이 존재한다고 가정 (54 PNG 풀세트).
 */
function comboHref({ hair, top, bottom }) {
  const parts = [];
  if (hair)   parts.push(`hair${hair}`);
  if (top)    parts.push(`top${top}`);
  if (bottom) parts.push(`pants${bottom}`);
  if (parts.length === 0) return START_AVATAR_HREF;
  return `${COMBOS_DIR}/${parts.join("+")}.png`;
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

  const idx = {
    hair:   indexFromSlug(slugFor("hair")),
    top:    indexFromSlug(slugFor("top")),
    bottom: indexFromSlug(slugFor("bottom")),
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
