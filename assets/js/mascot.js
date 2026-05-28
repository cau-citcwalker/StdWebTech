/* =============================================================
 * FinEdu — 아바타 컴포저 (휴머노이드 chibi v5 — outfit-only)
 *
 *   buildMascotSvg({ equipped, items, size = 360 })
 *   renderMascotInto(el, opts)
 *
 *   슬롯: outfit (단일)
 *     /assets/img/items/outfit/{slug}.jpeg
 *
 *   ViewBox 0 0 400 600 — JPEG 들은 portrait (~0.44 비율) 이라 fit-meet 으로
 *   가로 가운데 정렬되며 좌우 약간의 여백이 생긴다.
 *
 *   outfit 이 비어 있을 땐 BASE_BODY_SVG (bald + face baked-in) 가 fallback.
 *   ensure_starter_items 가 starter outfit 을 자동 장착해주므로 평상시엔 안 보임.
 * ============================================================= */

const BASE_BODY_SVG = `
  <ellipse cx="200" cy="586" rx="118" ry="9" fill="#000" opacity="0.10"/>
  <path d="M168 422 Q170 500 174 562 Q188 568 196 562 Q200 500 200 422 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>
  <path d="M232 422 Q230 500 226 562 Q212 568 204 562 Q200 500 200 422 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>
  <ellipse cx="184" cy="570" rx="22" ry="10" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <ellipse cx="216" cy="570" rx="22" ry="10" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <path d="M128 304 Q108 360 112 428 Q120 446 138 442 Q146 392 148 332 Q146 312 138 302 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>
  <path d="M272 304 Q292 360 288 428 Q280 446 262 442 Q254 392 252 332 Q254 312 262 302 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="118" cy="446" r="18" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <circle cx="282" cy="446" r="18" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <path d="M130 300 Q200 290 270 300 L262 422 Q200 442 138 422 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>
  <path d="M178 268 L222 268 L218 302 L182 302 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="200" cy="158" r="108" fill="#ffeacd" stroke="#b08570" stroke-width="5"/>
  <ellipse cx="98" cy="170" rx="12" ry="18" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <ellipse cx="302" cy="170" rx="12" ry="18" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <ellipse cx="138" cy="202" rx="16" ry="10" fill="#ffbcae" opacity="0.45"/>
  <ellipse cx="262" cy="202" rx="16" ry="10" fill="#ffbcae" opacity="0.45"/>
  <path d="M148 128 Q172 120 192 130" stroke="#3a2510" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M208 130 Q228 120 252 128" stroke="#3a2510" stroke-width="7" stroke-linecap="round" fill="none"/>
  <ellipse cx="172" cy="166" rx="18" ry="24" fill="#3a2510"/>
  <ellipse cx="228" cy="166" rx="18" ry="24" fill="#3a2510"/>
  <ellipse cx="178" cy="158" rx="6" ry="9" fill="#ffffff"/>
  <ellipse cx="234" cy="158" rx="6" ry="9" fill="#ffffff"/>
  <circle  cx="168" cy="176" r="2.5" fill="#ffffff" opacity="0.85"/>
  <circle  cx="224" cy="176" r="2.5" fill="#ffffff" opacity="0.85"/>
  <path d="M196 214 L200 222 L204 214" stroke="#d99088" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M188 242 Q200 246 212 242" stroke="#7a4030" stroke-width="3" fill="none" stroke-linecap="round"/>
`;

function outfitLayer(item) {
  if (!item?.slug) return BASE_BODY_SVG;
  return `<image href="/assets/img/items/outfit/${item.slug}.jpeg" x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid meet"/>`;
}

/**
 * @param {{ equipped?: Object, items?: Array, size?: number, withWrapper?: boolean }} opts
 * @returns {string} SVG markup
 */
export function buildMascotSvg({ equipped = {}, items = [], size = 360, withWrapper = true } = {}) {
  const itemsById = new Map((items || []).map((it) => [Number(it.id), it]));
  const outfitId = equipped.outfit;
  const outfitItem = outfitId ? itemsById.get(Number(outfitId)) : null;
  const body = outfitLayer(outfitItem);

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
