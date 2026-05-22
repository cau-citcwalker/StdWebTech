/* =============================================================
 * FinEdu — 마스코트 컴포저
 *
 * 기본 도토리 SVG + 장착된 아이템 SVG 조각을 합성해
 * 하나의 SVG markup 문자열로 돌려준다.
 *
 *   buildMascotSvg({ equipped, items, size = 320 })
 *   renderMascotInto(el, opts)
 *
 *   equipped: { slot: item_id }
 *   items: 카탈로그 (state.php 응답의 items)
 *
 *   레이어 순서 (뒤 → 앞):
 *     background  →  base mascot  →  scarf  →  glasses  →  hat
 * ============================================================= */

const LAYER_ORDER = ["background", "BASE", "scarf", "glasses", "hat"];

const BASE_MASCOT_SVG = `
  <ellipse cx="160" cy="296" rx="90" ry="10" fill="#000" opacity="0.12"/>
  <path d="M70 200 C 10 180, 20 90, 90 60 C 80 110, 110 170, 130 200 Z"
        fill="url(#fur)" stroke="#7a4116" stroke-width="6" stroke-linejoin="round"/>
  <path d="M70 195 C 35 175, 40 110, 90 80 C 90 120, 105 165, 120 190 Z"
        fill="#c47636" opacity="0.6"/>

  <ellipse cx="170" cy="220" rx="78" ry="68" fill="url(#fur)" stroke="#7a4116" stroke-width="6"/>
  <ellipse cx="170" cy="232" rx="48" ry="44" fill="url(#belly)"/>

  <ellipse cx="135" cy="282" rx="22" ry="14" fill="#9a5224" stroke="#7a4116" stroke-width="5"/>
  <ellipse cx="205" cy="282" rx="22" ry="14" fill="#9a5224" stroke="#7a4116" stroke-width="5"/>

  <g>
    <path d="M110 90 C 95 50, 130 30, 142 60 Z" fill="url(#fur)" stroke="#7a4116" stroke-width="6"/>
    <path d="M222 90 C 235 50, 200 30, 188 60 Z" fill="url(#fur)" stroke="#7a4116" stroke-width="6"/>
    <path d="M118 80 C 110 60, 130 50, 138 70 Z" fill="#ffb38a"/>
    <path d="M214 80 C 222 60, 202 50, 194 70 Z" fill="#ffb38a"/>

    <circle cx="166" cy="118" r="78" fill="url(#fur)" stroke="#7a4116" stroke-width="6"/>
    <ellipse cx="166" cy="138" rx="55" ry="42" fill="#ffe6cb"/>

    <circle cx="110" cy="142" r="14" fill="url(#cheek)"/>
    <circle cx="222" cy="142" r="14" fill="url(#cheek)"/>

    <g data-eye="left">
      <circle cx="142" cy="116" r="16" fill="#ffffff" stroke="#1f1f1f" stroke-width="3"/>
      <circle data-pupil cx="142" cy="116" r="9" fill="#1f1f1f"/>
      <circle cx="146" cy="112" r="3.2" fill="#ffffff"/>
    </g>
    <g data-eye="right">
      <circle cx="190" cy="116" r="16" fill="#ffffff" stroke="#1f1f1f" stroke-width="3"/>
      <circle data-pupil cx="190" cy="116" r="9" fill="#1f1f1f"/>
      <circle cx="194" cy="112" r="3.2" fill="#ffffff"/>
    </g>

    <path d="M160 138 q 6 -6 12 0 q -6 8 -12 0 Z" fill="#1f1f1f"/>
    <path d="M160 152 q 6 8 12 0" fill="none" stroke="#1f1f1f" stroke-width="4" stroke-linecap="round"/>
  </g>

  <g>
    <ellipse cx="232" cy="220" rx="22" ry="26" fill="#f4c47a" stroke="#7a4116" stroke-width="5"/>
    <path d="M212 200 q 20 -18 40 0 q -4 8 -20 8 q -16 0 -20 -8 Z" fill="#5e3713" stroke="#3d220a" stroke-width="3"/>
    <rect x="226" y="184" width="12" height="10" rx="3" fill="#5e3713"/>
  </g>
  <path d="M210 220 q -8 -10 -28 -8" fill="none" stroke="#7a4116" stroke-width="10" stroke-linecap="round"/>
`;

const DEFS = `
  <defs>
    <linearGradient id="fur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d68b4a"/>
      <stop offset="1" stop-color="#a35a26"/>
    </linearGradient>
    <linearGradient id="belly" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff2dd"/>
      <stop offset="1" stop-color="#ffd9a8"/>
    </linearGradient>
    <radialGradient id="cheek" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ff8aa0" stop-opacity="0.8"/>
      <stop offset="1" stop-color="#ff8aa0" stop-opacity="0"/>
    </radialGradient>
  </defs>
`;

/**
 * @param {{ equipped: Object, items: Array, size?: number, withDefs?: boolean }} opts
 * @returns {string}
 */
export function buildMascotSvg({ equipped = {}, items = [], size = 320, withDefs = true }) {
  const itemsById = new Map(items.map((it) => [Number(it.id), it]));

  const layers = LAYER_ORDER.map((slot) => {
    if (slot === "BASE") return BASE_MASCOT_SVG;
    const id = equipped[slot];
    if (!id) return "";
    const item = itemsById.get(Number(id));
    return item?.svg_markup ?? "";
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="${size}" height="${size}" role="img" aria-label="도토리 마스코트">
      ${withDefs ? DEFS : ""}
      ${layers.join("\n")}
    </svg>
  `;
}

/**
 * 주어진 컨테이너 엘리먼트 안에 마스코트를 렌더한다 (덮어쓰기).
 */
export function renderMascotInto(el, opts) {
  if (!el) return;
  el.innerHTML = buildMascotSvg(opts);
}
