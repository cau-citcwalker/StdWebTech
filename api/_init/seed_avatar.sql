-- =============================================================
-- FinEdu — 휴머노이드 아바타 아이템 시드 (v2 — 캐릭터 비율 보정)
--
-- 슬롯: hair · face · top · bottom · shoes · accessory
-- viewBox 는 베이스 캐릭터와 같은 0 0 400 600 기준.
--
-- starter 아이템 (rarity='starter') 은 ensure_starter_items() 가
-- 모든 사용자에게 자동 지급한다.
--
-- 주요 앵커:
--   head cx 200, cy 158, r 108
--   eye  cx 172 / 228, cy 162
--   mouth cy 210
--   shoulder line y 300, x 128–272
--   waist y 422, hip x 138–262
--   feet cx 184 / 216, cy 570
-- =============================================================

SET NAMES utf8mb4;

-- ----- HAIR ---------------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('hair-bald',  '대머리',     '깔끔한 민머리.',           'hair', '', 0, 'starter', 0),

  ('hair-black-bob', '검은 단발', '클래식한 검정 단발 머리.', 'hair',
   '<path d="M92 158 A108 108 0 0 1 308 158 Q304 174 290 168 Q268 144 234 138 Q216 130 200 138 Q184 130 166 138 Q132 144 110 168 Q96 174 92 158 Z" fill="#1f1f1f"/>',
   0, 'starter', 1),

  ('hair-brown-bob', '갈색 단발', '따뜻한 갈색 단발 머리.', 'hair',
   '<path d="M92 158 A108 108 0 0 1 308 158 Q304 174 290 168 Q268 144 234 138 Q216 130 200 138 Q184 130 166 138 Q132 144 110 168 Q96 174 92 158 Z" fill="#7a4a1a"/>',
   0, 'starter', 2),

  ('hair-blonde-pixy', '노란 픽시', '발랄한 노랑 픽시컷.', 'hair',
   '<path d="M92 158 A108 108 0 0 1 308 158 Q300 168 280 162 Q252 138 224 144 Q212 138 200 144 Q188 138 176 144 Q148 138 120 162 Q100 168 92 158 Z" fill="#ffd14d"/>',
   30, 'common', 3),

  ('hair-pink-twin', '분홍 양갈래', '귀여운 분홍 양갈래.', 'hair',
   '<g><path d="M92 158 A108 108 0 0 1 308 158 Q304 174 290 168 Q268 144 234 138 Q216 130 200 138 Q184 130 166 138 Q132 144 110 168 Q96 174 92 158 Z" fill="#ff86d0"/><ellipse cx="80" cy="232" rx="22" ry="44" fill="#ff86d0" stroke="#c43a73" stroke-width="3"/><ellipse cx="320" cy="232" rx="22" ry="44" fill="#ff86d0" stroke="#c43a73" stroke-width="3"/></g>',
   60, 'rare', 4),

  ('hair-white-long', '백발 장발', '신비로운 백발 장발.', 'hair',
   '<g><path d="M92 158 A108 108 0 0 1 308 158 Q304 196 296 230 Q278 188 240 178 Q200 170 160 178 Q122 188 104 230 Q96 196 92 158 Z" fill="#f0f0f0" stroke="#aaa" stroke-width="2"/><path d="M96 220 Q88 340 122 430 Q132 436 144 430 Q112 348 116 218 Z" fill="#f0f0f0" stroke="#aaa" stroke-width="2"/><path d="M304 220 Q312 340 278 430 Q268 436 256 430 Q288 348 284 218 Z" fill="#f0f0f0" stroke="#aaa" stroke-width="2"/></g>',
   120, 'epic', 5);

-- ----- FACE ---------------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('face-neutral', '기본 표정', '단정한 기본 표정.', 'face',
   '<g><path d="M150 130 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M222 130 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><ellipse cx="172" cy="162" rx="11" ry="15" fill="#3a2510"/><ellipse cx="228" cy="162" rx="11" ry="15" fill="#3a2510"/><circle cx="176" cy="156" r="4" fill="#fff"/><circle cx="232" cy="156" r="4" fill="#fff"/><path d="M190 208 q10 5 20 0" stroke="#3a2510" stroke-width="4" stroke-linecap="round" fill="none"/></g>',
   0, 'starter', 1),

  ('face-smile', '활짝 웃음', '기분 좋은 큰 미소.', 'face',
   '<g><path d="M150 132 q14 -8 28 -2" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M222 130 q14 -6 28 2" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M161 158 q11 -10 22 0 q-2 14 -11 14 q-9 0 -11 -14 z" fill="#3a2510"/><path d="M217 158 q11 -10 22 0 q-2 14 -11 14 q-9 0 -11 -14 z" fill="#3a2510"/><path d="M174 204 q26 24 52 0 q-2 10 -26 10 q-24 0 -26 -10 z" fill="#a0394a" stroke="#3a2510" stroke-width="3" stroke-linejoin="round"/></g>',
   0, 'starter', 2),

  ('face-wink', '윙크', '한쪽 눈 윙크.', 'face',
   '<g><path d="M150 130 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M222 130 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M161 162 q11 -8 22 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><ellipse cx="228" cy="162" rx="11" ry="15" fill="#3a2510"/><circle cx="232" cy="156" r="4" fill="#fff"/><path d="M184 208 q16 12 32 0" stroke="#3a2510" stroke-width="4" stroke-linecap="round" fill="none"/></g>',
   0, 'starter', 3),

  ('face-sleepy', '졸린 눈', '나른한 표정.', 'face',
   '<g><path d="M150 134 q14 4 28 -2" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M222 132 q14 -2 28 2" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M160 160 h24 q-1 7 -12 7 q-11 0 -12 -7 z" fill="#3a2510"/><path d="M216 160 h24 q-1 7 -12 7 q-11 0 -12 -7 z" fill="#3a2510"/><line x1="192" y1="212" x2="208" y2="212" stroke="#3a2510" stroke-width="4" stroke-linecap="round"/></g>',
   20, 'common', 4),

  ('face-angry', '화남', '뾰루퉁한 화난 표정.', 'face',
   '<g><path d="M150 122 q14 16 28 6" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M222 128 q14 -10 28 -6" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><ellipse cx="172" cy="164" rx="11" ry="13" fill="#3a2510"/><ellipse cx="228" cy="164" rx="11" ry="13" fill="#3a2510"/><path d="M188 218 q12 -10 24 0" stroke="#3a2510" stroke-width="4" stroke-linecap="round" fill="none"/></g>',
   25, 'common', 5),

  ('face-stars', '반짝반짝', '두 눈에 별이 반짝!', 'face',
   '<g><path d="M150 130 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M222 130 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M172 148 l3 8 8 2 -8 2 -3 8 -3 -8 -8 -2 8 -2 z" fill="#ffc800" stroke="#3a2510" stroke-width="2"/><path d="M228 148 l3 8 8 2 -8 2 -3 8 -3 -8 -8 -2 8 -2 z" fill="#ffc800" stroke="#3a2510" stroke-width="2"/><path d="M186 206 q14 14 28 0" stroke="#3a2510" stroke-width="4" stroke-linecap="round" fill="none"/></g>',
   80, 'rare', 6);

-- ----- TOP ----------------------------------------------------
-- 토르소 영역: shoulder line(y 300, x 128-272) → waist(y 422, x 138-262)
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('top-white-tank', '흰 탱크탑', '기본 흰 탱크탑.', 'top',
   '<g><path d="M126 304 Q200 294 274 304 L264 426 Q200 446 136 426 Z" fill="#ffffff" stroke="#777" stroke-width="3" stroke-linejoin="round"/><path d="M178 304 q22 -8 44 0" stroke="#777" stroke-width="3" fill="none"/></g>',
   0, 'starter', 1),

  ('top-gray-tee', '회색 티셔츠', '편한 회색 반팔.', 'top',
   '<g><path d="M132 302 Q200 290 268 302 L260 422 Q200 442 140 422 Z" fill="#bdbdbd" stroke="#555" stroke-width="3" stroke-linejoin="round"/><path d="M132 302 Q108 320 102 352 Q120 360 138 352 Z" fill="#bdbdbd" stroke="#555" stroke-width="3" stroke-linejoin="round"/><path d="M268 302 Q292 320 298 352 Q280 360 262 352 Z" fill="#bdbdbd" stroke="#555" stroke-width="3" stroke-linejoin="round"/><path d="M182 304 q18 8 36 0" stroke="#555" stroke-width="3" fill="none"/></g>',
   0, 'starter', 2),

  ('top-black-hoodie', '검은 후디', '쿨한 검정 후디.', 'top',
   '<g><path d="M132 302 Q200 290 268 302 L260 422 Q200 442 140 422 Z" fill="#222" stroke="#000" stroke-width="3" stroke-linejoin="round"/><path d="M132 302 Q108 320 102 392 Q124 402 144 392 Q142 348 138 304 Z" fill="#222" stroke="#000" stroke-width="3" stroke-linejoin="round"/><path d="M268 302 Q292 320 298 392 Q276 402 256 392 Q258 348 262 304 Z" fill="#222" stroke="#000" stroke-width="3" stroke-linejoin="round"/><path d="M158 274 Q200 258 242 274 Q250 290 244 304 Q200 314 156 304 Q150 290 158 274 Z" fill="#1a1a1a" stroke="#000" stroke-width="3"/><line x1="188" y1="304" x2="192" y2="332" stroke="#bbb" stroke-width="2"/><line x1="212" y1="304" x2="208" y2="332" stroke="#bbb" stroke-width="2"/><rect x="172" y="368" width="56" height="36" rx="4" fill="#1a1a1a" stroke="#000" stroke-width="2"/></g>',
   50, 'common', 3),

  ('top-red-shirt', '빨간 셔츠', '쨍한 빨간 셔츠.', 'top',
   '<g><path d="M132 302 Q200 290 268 302 L260 422 Q200 442 140 422 Z" fill="#ff4b4b" stroke="#7a1a1a" stroke-width="3" stroke-linejoin="round"/><path d="M132 302 Q108 320 102 352 Q120 360 138 352 Z" fill="#ff4b4b" stroke="#7a1a1a" stroke-width="3" stroke-linejoin="round"/><path d="M268 302 Q292 320 298 352 Q280 360 262 352 Z" fill="#ff4b4b" stroke="#7a1a1a" stroke-width="3" stroke-linejoin="round"/><path d="M182 304 q18 8 36 0" stroke="#7a1a1a" stroke-width="3" fill="none"/></g>',
   40, 'common', 4),

  ('top-beige-jacket', '베이지 자켓', '단정한 베이지 자켓.', 'top',
   '<g><path d="M132 302 Q200 290 268 302 L260 422 Q200 442 140 422 Z" fill="#e8d5b0" stroke="#7a5300" stroke-width="3" stroke-linejoin="round"/><path d="M132 302 Q108 320 100 392 Q124 404 144 392 Q142 348 138 304 Z" fill="#e8d5b0" stroke="#7a5300" stroke-width="3" stroke-linejoin="round"/><path d="M268 302 Q292 320 300 392 Q276 404 256 392 Q258 348 262 304 Z" fill="#e8d5b0" stroke="#7a5300" stroke-width="3" stroke-linejoin="round"/><line x1="200" y1="304" x2="200" y2="424" stroke="#7a5300" stroke-width="2"/></g>',
   80, 'rare', 5),

  ('top-gr-hoodie', '로고 후디', '큰 GR 로고가 새겨진 후디.', 'top',
   '<g><path d="M132 302 Q200 290 268 302 L260 422 Q200 442 140 422 Z" fill="#c0c0c0" stroke="#444" stroke-width="3" stroke-linejoin="round"/><path d="M132 302 Q108 320 102 392 Q124 402 144 392 Q142 348 138 304 Z" fill="#c0c0c0" stroke="#444" stroke-width="3" stroke-linejoin="round"/><path d="M268 302 Q292 320 298 392 Q276 402 256 392 Q258 348 262 304 Z" fill="#c0c0c0" stroke="#444" stroke-width="3" stroke-linejoin="round"/><path d="M158 274 Q200 258 242 274 Q250 290 244 304 Q200 314 156 304 Q150 290 158 274 Z" fill="#aaa" stroke="#444" stroke-width="3"/><text x="200" y="372" text-anchor="middle" font-size="32" font-weight="900" fill="#444">GR</text></g>',
   100, 'rare', 6);

-- ----- BOTTOM -------------------------------------------------
-- 허리(y 422) → 무릎(y 514) 사이를 덮음. 두 다리 사이는 가랑이 갈라짐.
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('bottom-white-shorts', '흰 반바지', '기본 흰 반바지.', 'bottom',
   '<g><path d="M138 422 Q200 412 262 422 Q272 470 232 510 Q216 518 202 510 L202 460 Q200 456 198 460 L198 510 Q184 518 168 510 Q128 470 138 422 Z" fill="#ffffff" stroke="#777" stroke-width="3" stroke-linejoin="round"/><line x1="200" y1="424" x2="200" y2="456" stroke="#777" stroke-width="2"/></g>',
   0, 'starter', 1),

  ('bottom-blue-jeans', '청바지', '편한 데님 청바지.', 'bottom',
   '<g><path d="M138 422 Q200 414 262 422 Q268 480 232 562 Q216 568 202 562 L208 462 Q200 458 192 462 L198 562 Q184 568 168 562 Q132 480 138 422 Z" fill="#3a5a8e" stroke="#1a2a4a" stroke-width="3" stroke-linejoin="round"/><line x1="200" y1="424" x2="200" y2="460" stroke="#1a2a4a" stroke-width="2"/><rect x="158" y="438" width="14" height="16" rx="2" fill="none" stroke="#1a2a4a" stroke-width="2"/><rect x="228" y="438" width="14" height="16" rx="2" fill="none" stroke="#1a2a4a" stroke-width="2"/></g>',
   0, 'starter', 2),

  ('bottom-cargo', '카고 팬츠', '주머니 많은 카고 팬츠.', 'bottom',
   '<g><path d="M138 422 Q200 414 262 422 Q268 480 232 562 Q216 568 202 562 L208 462 Q200 458 192 462 L198 562 Q184 568 168 562 Q132 480 138 422 Z" fill="#5a6b3a" stroke="#2a3a1a" stroke-width="3" stroke-linejoin="round"/><rect x="154" y="478" width="22" height="26" rx="2" fill="none" stroke="#2a3a1a" stroke-width="2"/><rect x="224" y="478" width="22" height="26" rx="2" fill="none" stroke="#2a3a1a" stroke-width="2"/></g>',
   40, 'common', 3),

  ('bottom-red-trunks', '빨간 트렁크', '해변 분위기 빨간 트렁크.', 'bottom',
   '<g><path d="M138 422 Q200 412 262 422 Q268 466 224 506 Q210 512 200 506 L202 462 Q200 458 198 462 L200 506 Q190 512 176 506 Q132 466 138 422 Z" fill="#c14040" stroke="#7a1a1a" stroke-width="3" stroke-linejoin="round"/><path d="M186 422 q14 10 28 0 q-2 6 -14 6 q-12 0 -14 -6 z" fill="#fff" stroke="#7a1a1a" stroke-width="2"/></g>',
   30, 'common', 4),

  ('bottom-black-jeans', '검정 슬림진', '슬림한 검정 진.', 'bottom',
   '<g><path d="M138 422 Q200 414 262 422 Q266 480 228 562 Q214 568 202 562 L206 462 Q200 458 194 462 L198 562 Q186 568 172 562 Q134 480 138 422 Z" fill="#181818" stroke="#000" stroke-width="3" stroke-linejoin="round"/></g>',
   60, 'rare', 5);

-- ----- SHOES --------------------------------------------------
-- 발 cx 184 / 216, cy 570
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('shoes-white-sneakers', '흰 운동화', '기본 흰 운동화.', 'shoes',
   '<g><ellipse cx="184" cy="568" rx="26" ry="13" fill="#fff" stroke="#1f1f1f" stroke-width="3"/><ellipse cx="216" cy="568" rx="26" ry="13" fill="#fff" stroke="#1f1f1f" stroke-width="3"/><path d="M168 568 q16 -4 32 0" stroke="#bbb" stroke-width="2" fill="none"/><path d="M200 568 q16 -4 32 0" stroke="#bbb" stroke-width="2" fill="none"/></g>',
   0, 'starter', 1),

  ('shoes-black-sneakers', '검정 운동화', '깔끔한 검정 운동화.', 'shoes',
   '<g><ellipse cx="184" cy="568" rx="26" ry="13" fill="#1f1f1f" stroke="#000" stroke-width="3"/><ellipse cx="216" cy="568" rx="26" ry="13" fill="#1f1f1f" stroke="#000" stroke-width="3"/><path d="M160 568 q24 6 48 0" stroke="#fff" stroke-width="2" fill="none"/><path d="M192 568 q24 6 48 0" stroke="#fff" stroke-width="2" fill="none"/></g>',
   30, 'common', 2),

  ('shoes-checker-slipon', '체커 슬립온', '클래식 체커보드 슬립온.', 'shoes',
   '<g><ellipse cx="184" cy="568" rx="26" ry="13" fill="#fff" stroke="#1f1f1f" stroke-width="3"/><ellipse cx="216" cy="568" rx="26" ry="13" fill="#fff" stroke="#1f1f1f" stroke-width="3"/><g fill="#1f1f1f"><rect x="162" y="560" width="6" height="6"/><rect x="174" y="560" width="6" height="6"/><rect x="168" y="566" width="6" height="6"/><rect x="180" y="566" width="6" height="6"/><rect x="194" y="560" width="6" height="6"/><rect x="206" y="560" width="6" height="6"/><rect x="200" y="566" width="6" height="6"/><rect x="212" y="566" width="6" height="6"/><rect x="222" y="560" width="6" height="6"/><rect x="228" y="566" width="6" height="6"/></g></g>',
   60, 'common', 3),

  ('shoes-rainbow-runners', '무지개 런너', '에어 쿠션이 빛나는 런닝화.', 'shoes',
   '<g><ellipse cx="184" cy="568" rx="28" ry="14" fill="#1f1f1f" stroke="#000" stroke-width="3"/><ellipse cx="216" cy="568" rx="28" ry="14" fill="#1f1f1f" stroke="#000" stroke-width="3"/><path d="M158 572 q12 8 26 0" stroke="#58cc02" stroke-width="3" fill="none"/><path d="M190 572 q12 8 26 0" stroke="#58cc02" stroke-width="3" fill="none"/><path d="M160 566 q12 -4 24 0" stroke="#ff4b4b" stroke-width="2" fill="none"/><path d="M192 566 q12 -4 24 0" stroke="#1cb0f6" stroke-width="2" fill="none"/></g>',
   90, 'rare', 4),

  ('shoes-boots', '워커 부츠', '단단한 가죽 부츠.', 'shoes',
   '<g><path d="M158 536 h28 q4 16 4 30 q-14 6 -28 0 q-4 -14 -4 -30 z" fill="#3a2510" stroke="#1a0f00" stroke-width="3" stroke-linejoin="round"/><path d="M214 536 h28 q0 16 -4 30 q-14 6 -28 0 q0 -14 4 -30 z" fill="#3a2510" stroke="#1a0f00" stroke-width="3" stroke-linejoin="round"/><line x1="162" y1="548" x2="186" y2="548" stroke="#fff" stroke-width="1.5"/><line x1="218" y1="548" x2="242" y2="548" stroke="#fff" stroke-width="1.5"/></g>',
   70, 'rare', 5);

-- ----- ACCESSORY ----------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('acc-black-cap', '검은 캡',     '챙이 긴 검정 캡.', 'accessory',
   '<g><path d="M118 100 Q160 70 200 70 Q240 70 282 100 Q286 116 270 124 Q200 138 130 124 Q114 116 118 100 Z" fill="#1f1f1f"/><path d="M86 116 Q200 142 314 116 Q310 124 302 132 Q200 152 98 132 Q90 124 86 116 Z" fill="#1f1f1f"/></g>',
   50, 'common', 1),

  ('acc-beanie',    '검은 비니',   '따뜻한 검정 비니.', 'accessory',
   '<g><path d="M104 110 Q140 58 200 58 Q260 58 296 110 Q288 134 200 134 Q112 134 104 110 Z" fill="#1f1f1f"/><path d="M104 110 Q200 132 296 110 Q294 128 286 134 Q200 148 114 134 Q106 128 104 110 Z" fill="#2a2a2a"/></g>',
   40, 'common', 2),

  ('acc-round-glasses', '둥근 안경', '클래식한 둥근 뿔테.', 'accessory',
   '<g fill="none" stroke="#1f1f1f" stroke-width="4"><circle cx="172" cy="162" r="22"/><circle cx="228" cy="162" r="22"/><line x1="194" y1="162" x2="206" y2="162"/></g>',
   30, 'common', 3),

  ('acc-sunglasses', '선글라스',  '쿨한 검정 선글라스.', 'accessory',
   '<g><rect x="140" y="146" width="58" height="32" rx="8" fill="#1f1f1f"/><rect x="202" y="146" width="58" height="32" rx="8" fill="#1f1f1f"/><line x1="198" y1="162" x2="202" y2="162" stroke="#1f1f1f" stroke-width="6"/><polygon points="146,152 168,152 164,158 144,158" fill="#666"/><polygon points="208,152 230,152 226,158 206,158" fill="#666"/></g>',
   70, 'rare', 4),

  ('acc-heart-shades', '하트 선글라스', '사랑이 가득한 하트 선글라스.', 'accessory',
   '<g fill="#ff86d0" stroke="#c43a73" stroke-width="3"><path d="M142 148 c-8 -10 12 -16 30 -2 c18 -14 38 -8 30 2 c-4 18 -30 36 -30 36 c0 0 -26 -18 -30 -36 z"/><path d="M198 148 c-8 -10 12 -16 30 -2 c18 -14 38 -8 30 2 c-4 18 -30 36 -30 36 c0 0 -26 -18 -30 -36 z"/></g>',
   100, 'rare', 5),

  ('acc-camera', '카메라', '목에 건 빈티지 카메라.', 'accessory',
   '<g><line x1="180" y1="270" x2="166" y2="350" stroke="#5a3a1a" stroke-width="3"/><line x1="220" y1="270" x2="234" y2="350" stroke="#5a3a1a" stroke-width="3"/><rect x="160" y="340" width="80" height="54" rx="8" fill="#1f1f1f" stroke="#000" stroke-width="3"/><circle cx="200" cy="368" r="18" fill="#444" stroke="#000" stroke-width="3"/><circle cx="200" cy="368" r="10" fill="#222"/><rect x="222" y="346" width="10" height="6" rx="1" fill="#666"/></g>',
   120, 'rare', 6),

  ('acc-crown', '왕관',   '오늘의 학습왕!', 'accessory',
   '<g><polygon points="124,82 142,46 174,76 200,30 226,76 258,46 276,82" fill="#ffc800" stroke="#7a5300" stroke-width="4" stroke-linejoin="round"/><rect x="124" y="74" width="152" height="14" rx="2" fill="#d39400" stroke="#7a5300" stroke-width="4"/><circle cx="142" cy="50" r="6" fill="#ff86d0" stroke="#7a1a1a" stroke-width="2"/><circle cx="200" cy="34" r="6" fill="#1cb0f6" stroke="#075f8a" stroke-width="2"/><circle cx="258" cy="50" r="6" fill="#ce82ff" stroke="#7a1a7a" stroke-width="2"/></g>',
   250, 'epic', 7);
