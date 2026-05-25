/* =============================================================
 * FinEdu — 아바타 컴포저 (휴머노이드)
 *
 * 기본 캐릭터(naked chibi) + 슬롯 아이템 SVG 조각을 합성해
 * 하나의 SVG markup 문자열로 돌려준다.
 *
 *   buildMascotSvg({ equipped, items, size = 360 })
 *   renderMascotInto(el, opts)
 *
 *   슬롯: hair / face / top / bottom / shoes / accessory
 *   레이어 순서 (뒤 → 앞):
 *     BASE → bottom → top → shoes → face → hair → accessory
 *
 *   ViewBox 0 0 400 600 (3:4.5 비율, 위쪽이 머리)
 * ============================================================= */

const LAYER_ORDER = ["BASE", "bottom", "top", "shoes", "face", "hair", "accessory"];

const BASE_BODY_SVG = `
  <!-- 그림자 -->
  <ellipse cx="200" cy="586" rx="120" ry="9" fill="#000" opacity="0.10"/>

  <!-- 다리 (피부) -->
  <path d="M170 450 q-2 80 -4 110 q14 6 28 0 q-2 -30 -4 -110 z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>
  <path d="M210 450 q2 80 4 110 q14 6 28 0 q-2 -30 -4 -110 z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>

  <!-- 발 (기본 맨발 — shoes 슬롯이 덮음) -->
  <ellipse cx="184" cy="572" rx="22" ry="10" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <ellipse cx="224" cy="572" rx="22" ry="10" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>

  <!-- 팔 -->
  <path d="M132 320 q-12 60 0 100 q14 6 24 0 q12 -50 0 -110 z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>
  <path d="M268 320 q12 60 0 100 q-14 6 -24 0 q-12 -50 0 -110 z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>

  <!-- 손 -->
  <circle cx="138" cy="430" r="16" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <circle cx="262" cy="430" r="16" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>

  <!-- 토르소 (몸통, top 슬롯이 덮음) -->
  <path d="M152 300 q48 -16 96 0 v140 q-48 14 -96 0 z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>

  <!-- 목 -->
  <rect x="184" y="262" width="32" height="40" rx="4"
        fill="#ffeacd" stroke="#b08570" stroke-width="4"/>

  <!-- 머리 (대머리, hair 슬롯이 덮음) -->
  <circle cx="200" cy="170" r="116"
          fill="#ffeacd" stroke="#b08570" stroke-width="5"/>

  <!-- 귀 -->
  <ellipse cx="86" cy="180" rx="14" ry="22"
           fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <ellipse cx="314" cy="180" rx="14" ry="22"
           fill="#ffeacd" stroke="#b08570" stroke-width="4"/>

  <!-- 볼터치 -->
  <ellipse cx="118" cy="208" rx="20" ry="14" fill="#ffaac0" opacity="0.5"/>
  <ellipse cx="282" cy="208" rx="20" ry="14" fill="#ffaac0" opacity="0.5"/>
`;

/**
 * @param {{ equipped?: Object, items?: Array, size?: number, withWrapper?: boolean }} opts
 * @returns {string} SVG markup
 */
export function buildMascotSvg({ equipped = {}, items = [], size = 360, withWrapper = true } = {}) {
  const itemsById = new Map((items || []).map((it) => [Number(it.id), it]));

  const layers = LAYER_ORDER.map((slot) => {
    if (slot === "BASE") return BASE_BODY_SVG;
    const id = equipped[slot];
    if (!id) return "";
    const item = itemsById.get(Number(id));
    return item?.svg_markup ?? "";
  });

  const body = layers.join("\n");
  if (!withWrapper) return body;

  // 너비를 size 로 두면 높이는 viewBox 비율(1.5)에 맞춰 자동 — auto 로 비워둔다.
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
