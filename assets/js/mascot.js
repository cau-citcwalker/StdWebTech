/* =============================================================
 * FinEdu — 아바타 컴포저 (휴머노이드 chibi v2)
 *
 *   buildMascotSvg({ equipped, items, size = 360 })
 *   renderMascotInto(el, opts)
 *
 *   슬롯: hair / face / top / bottom / shoes / accessory
 *   레이어 순서 (뒤 → 앞):
 *     BASE → bottom → top → shoes → face → hair → accessory
 *
 *   ViewBox 0 0 400 600
 *
 *   주요 앵커 (아이템 SVG 디자인 시 참조):
 *     head    cx 200, cy 158, r 108
 *     neck    x 180–220, y 260–300
 *     shoulder line  y 300, x 128–272 (좌우 어깨)
 *     waist line     y 422, x 152–248
 *     hip / 가랑이    y 446
 *     무릎              y 514
 *     발등              y 568
 *     팔 끝(손)         (118, 446) · (282, 446)
 *     눈                cx 172 · cx 228,  cy 162
 *     입                cy 210
 * ============================================================= */

const LAYER_ORDER = ["BASE", "bottom", "top", "shoes", "face", "hair", "accessory"];

const BASE_BODY_SVG = `
  <!-- 그림자 -->
  <ellipse cx="200" cy="586" rx="118" ry="9" fill="#000" opacity="0.10"/>

  <!-- 다리 (살색) -->
  <path d="M168 422 Q170 500 174 562 Q188 568 196 562 Q200 500 200 422 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>
  <path d="M232 422 Q230 500 226 562 Q212 568 204 562 Q200 500 200 422 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>

  <!-- 발 (맨발 — shoes 슬롯이 덮음) -->
  <ellipse cx="184" cy="570" rx="22" ry="10" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <ellipse cx="216" cy="570" rx="22" ry="10" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>

  <!-- 팔 (어깨에서 손까지 하나의 곡선) -->
  <path d="M128 304 Q108 360 112 428 Q120 446 138 442 Q146 392 148 332 Q146 312 138 302 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>
  <path d="M272 304 Q292 360 288 428 Q280 446 262 442 Q254 392 252 332 Q254 312 262 302 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>

  <!-- 손 -->
  <circle cx="118" cy="446" r="18" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <circle cx="282" cy="446" r="18" fill="#ffeacd" stroke="#b08570" stroke-width="4"/>

  <!-- 토르소 — 어깨가 넓고 허리가 살짝 좁아지는 사다리꼴 -->
  <path d="M130 300 Q200 290 270 300 L262 422 Q200 442 138 422 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>

  <!-- 목 (토르소 위에 덮음) -->
  <path d="M178 268 L222 268 L218 302 L182 302 Z"
        fill="#ffeacd" stroke="#b08570" stroke-width="4" stroke-linejoin="round"/>

  <!-- 머리 -->
  <circle cx="200" cy="158" r="108"
          fill="#ffeacd" stroke="#b08570" stroke-width="5"/>

  <!-- 귀 (머리 옆에 붙여) -->
  <ellipse cx="98" cy="170" rx="12" ry="18"
           fill="#ffeacd" stroke="#b08570" stroke-width="4"/>
  <ellipse cx="302" cy="170" rx="12" ry="18"
           fill="#ffeacd" stroke="#b08570" stroke-width="4"/>

  <!-- 볼터치 -->
  <ellipse cx="138" cy="196" rx="18" ry="13" fill="#ffaac0" opacity="0.55"/>
  <ellipse cx="262" cy="196" rx="18" ry="13" fill="#ffaac0" opacity="0.55"/>

  <!-- 기본 아웃핏 (baked) — bottom/top/shoes 슬롯이 덮어쓸 수 있음 -->
  <!-- 흰 반바지 (다리 중심에 정렬) -->
  <path d="M138 422 Q200 412 262 422 Q272 470 232 510 Q216 518 202 510 L202 460 Q200 456 198 460 L198 510 Q184 518 168 510 Q128 470 138 422 Z"
        fill="#ffffff" stroke="#777" stroke-width="3" stroke-linejoin="round"/>
  <line x1="200" y1="424" x2="200" y2="456" stroke="#777" stroke-width="2"/>
  <!-- 흰 탱크탑 -->
  <path d="M126 304 Q200 294 274 304 L264 426 Q200 446 136 426 Z"
        fill="#ffffff" stroke="#777" stroke-width="3" stroke-linejoin="round"/>
  <path d="M178 304 q22 -8 44 0" stroke="#777" stroke-width="3" fill="none"/>
  <!-- 흰 운동화 (발 cx 184 / 216 와 정렬) -->
  <ellipse cx="184" cy="568" rx="26" ry="13" fill="#fff" stroke="#1f1f1f" stroke-width="3"/>
  <ellipse cx="216" cy="568" rx="26" ry="13" fill="#fff" stroke="#1f1f1f" stroke-width="3"/>
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
