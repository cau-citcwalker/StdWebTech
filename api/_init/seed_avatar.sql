-- =============================================================
-- FinEdu — 휴머노이드 아바타 아이템 시드
--
-- 슬롯: hair · face · top · bottom · shoes · accessory
-- viewBox 는 베이스 캐릭터와 같은 0 0 400 600 기준.
--
-- starter 아이템 (rarity='starter') 은 ensure_starter_items() 가
-- 모든 사용자에게 자동 지급한다 — 풍부한 초기 선택지 제공.
-- =============================================================

SET NAMES utf8mb4;

-- ----- HAIR ---------------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('hair-bald',  '대머리',     '깔끔한 민머리.',           'hair', '', 0, 'starter', 0),
  ('hair-black-bob', '검은 단발', '클래식한 검정 단발 머리.', 'hair',
   '<g><path d="M88 175 q-2 -95 112 -110 q114 15 112 110 q0 16 -12 24 q-18 -34 -56 -42 q-44 -12 -88 0 q-38 8 -56 42 q-12 -8 -12 -24 z" fill="#1f1f1f"/><path d="M124 138 q40 -28 76 -28 q36 0 76 28 q-12 28 -50 36 q-12 -16 -26 -2 q-14 -14 -26 2 q-38 -8 -50 -36 z" fill="#1f1f1f"/></g>',
   0, 'starter', 1),
  ('hair-brown-bob', '갈색 단발', '따뜻한 갈색 단발 머리.', 'hair',
   '<g><path d="M88 175 q-2 -95 112 -110 q114 15 112 110 q0 16 -12 24 q-18 -34 -56 -42 q-44 -12 -88 0 q-38 8 -56 42 q-12 -8 -12 -24 z" fill="#7a4a1a"/><path d="M124 138 q40 -28 76 -28 q36 0 76 28 q-12 28 -50 36 q-12 -16 -26 -2 q-14 -14 -26 2 q-38 -8 -50 -36 z" fill="#7a4a1a"/></g>',
   0, 'starter', 2),
  ('hair-blonde-pixy', '노란 픽시', '발랄한 노랑 픽시컷.', 'hair',
   '<g><path d="M96 168 q0 -88 104 -108 q104 20 104 108 q0 12 -10 18 q-12 -28 -42 -38 q-32 26 -52 4 q-20 22 -52 -4 q-30 10 -42 38 q-10 -6 -10 -18 z" fill="#ffd14d"/><path d="M132 130 q34 -24 68 -24 q34 0 68 24 q-10 26 -42 30 q-12 -14 -26 4 q-14 -18 -26 -4 q-32 -4 -42 -30 z" fill="#ffd14d"/></g>',
   30, 'common', 3),
  ('hair-pink-twin', '분홍 양갈래', '귀여운 분홍 양갈래.', 'hair',
   '<g><path d="M96 168 q0 -88 104 -108 q104 20 104 108 q0 14 -12 22 q-16 -32 -52 -42 q-40 -10 -80 0 q-36 10 -52 42 q-12 -8 -12 -22 z" fill="#ff86d0"/><path d="M128 138 q36 -28 72 -28 q36 0 72 28 q-12 24 -44 32 q-14 -18 -28 -4 q-14 -14 -28 4 q-32 -8 -44 -32 z" fill="#ff86d0"/><ellipse cx="80" cy="240" rx="20" ry="40" fill="#ff86d0" stroke="#c43a73" stroke-width="3"/><ellipse cx="320" cy="240" rx="20" ry="40" fill="#ff86d0" stroke="#c43a73" stroke-width="3"/></g>',
   60, 'rare', 4),
  ('hair-white-long', '백발 장발', '신비로운 백발 장발.', 'hair',
   '<g><path d="M70 220 q-4 -130 130 -160 q134 30 130 160 q0 30 -16 36 q-20 -38 -62 -50 q-52 -14 -104 0 q-42 12 -62 50 q-16 -6 -16 -36 z" fill="#f0f0f0" stroke="#aaa" stroke-width="2"/><path d="M80 240 q-4 80 30 130 q12 6 22 0 q-26 -60 -28 -130 z" fill="#f0f0f0" stroke="#aaa" stroke-width="2"/><path d="M320 240 q4 80 -30 130 q-12 6 -22 0 q26 -60 28 -130 z" fill="#f0f0f0" stroke="#aaa" stroke-width="2"/></g>',
   120, 'epic', 5);

-- ----- FACE ---------------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('face-neutral', '기본 표정', '단정한 기본 표정.', 'face',
   '<g><path d="M138 140 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M234 140 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><ellipse cx="155" cy="172" rx="11" ry="16" fill="#3a2510"/><ellipse cx="245" cy="172" rx="11" ry="16" fill="#3a2510"/><circle cx="159" cy="166" r="4" fill="#fff"/><circle cx="249" cy="166" r="4" fill="#fff"/><path d="M190 218 q10 5 20 0" stroke="#3a2510" stroke-width="4" stroke-linecap="round" fill="none"/></g>',
   0, 'starter', 1),
  ('face-smile', '활짝 웃음', '기분 좋은 큰 미소.', 'face',
   '<g><path d="M138 142 q14 -8 28 -2" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M234 140 q14 -6 28 2" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M144 165 q11 -10 22 0 q-2 14 -11 14 q-9 0 -11 -14 z" fill="#3a2510"/><path d="M234 165 q11 -10 22 0 q-2 14 -11 14 q-9 0 -11 -14 z" fill="#3a2510"/><path d="M170 215 q30 30 60 0 q-2 10 -30 10 q-28 0 -30 -10 z" fill="#a0394a" stroke="#3a2510" stroke-width="3" stroke-linejoin="round"/></g>',
   0, 'starter', 2),
  ('face-wink', '윙크', '한쪽 눈 윙크.', 'face',
   '<g><path d="M138 140 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M234 140 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M144 172 q11 -8 22 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><ellipse cx="245" cy="172" rx="11" ry="16" fill="#3a2510"/><circle cx="249" cy="166" r="4" fill="#fff"/><path d="M180 215 q20 14 40 0" stroke="#3a2510" stroke-width="4" stroke-linecap="round" fill="none"/></g>',
   0, 'starter', 3),
  ('face-sleepy', '졸린 눈', '나른한 표정.', 'face',
   '<g><path d="M138 144 q14 4 28 -2" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M234 142 q14 -2 28 2" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M144 170 h22 q-1 6 -11 6 q-10 0 -11 -6 z" fill="#3a2510"/><path d="M234 170 h22 q-1 6 -11 6 q-10 0 -11 -6 z" fill="#3a2510"/><line x1="190" y1="220" x2="210" y2="220" stroke="#3a2510" stroke-width="4" stroke-linecap="round"/></g>',
   20, 'common', 4),
  ('face-angry', '화남', '뾰루퉁한 화난 표정.', 'face',
   '<g><path d="M138 130 q14 16 28 6" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M234 136 q14 -10 28 -6" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><ellipse cx="155" cy="172" rx="11" ry="14" fill="#3a2510"/><ellipse cx="245" cy="172" rx="11" ry="14" fill="#3a2510"/><path d="M186 224 q14 -10 28 0" stroke="#3a2510" stroke-width="4" stroke-linecap="round" fill="none"/></g>',
   25, 'common', 5),
  ('face-stars', '반짝반짝', '두 눈에 별이 반짝!', 'face',
   '<g><path d="M138 140 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M234 140 q14 -6 28 0" stroke="#3a2510" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M155 158 l3 8 8 2 -8 2 -3 8 -3 -8 -8 -2 8 -2 z" fill="#ffc800" stroke="#3a2510" stroke-width="2"/><path d="M245 158 l3 8 8 2 -8 2 -3 8 -3 -8 -8 -2 8 -2 z" fill="#ffc800" stroke="#3a2510" stroke-width="2"/><path d="M186 218 q14 12 28 0" stroke="#3a2510" stroke-width="4" stroke-linecap="round" fill="none"/></g>',
   80, 'rare', 6);

-- ----- TOP ----------------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('top-white-tank', '흰 탱크탑', '기본 흰 탱크탑.', 'top',
   '<g><path d="M156 296 q44 -10 88 0 v140 q-44 12 -88 0 z" fill="#ffffff" stroke="#777" stroke-width="3" stroke-linejoin="round"/><path d="M186 296 q14 8 28 0" stroke="#777" stroke-width="3" fill="none"/></g>',
   0, 'starter', 1),
  ('top-gray-tee', '회색 티셔츠', '편한 회색 반팔.', 'top',
   '<g><path d="M148 290 q52 -14 104 0 v146 q-52 14 -104 0 z" fill="#bdbdbd" stroke="#555" stroke-width="3" stroke-linejoin="round"/><path d="M148 290 q-22 14 -28 36 q14 14 30 6 z" fill="#bdbdbd" stroke="#555" stroke-width="3" stroke-linejoin="round"/><path d="M252 290 q22 14 28 36 q-14 14 -30 6 z" fill="#bdbdbd" stroke="#555" stroke-width="3" stroke-linejoin="round"/><path d="M184 290 q16 10 32 0" stroke="#555" stroke-width="3" fill="none"/></g>',
   0, 'starter', 2),
  ('top-black-hoodie', '검은 후디', '쿨한 검정 후디.', 'top',
   '<g><path d="M148 290 q52 -16 104 0 v146 q-52 14 -104 0 z" fill="#222" stroke="#000" stroke-width="3" stroke-linejoin="round"/><path d="M148 290 q-26 20 -32 50 q16 14 36 6 q-2 -32 -4 -56 z" fill="#222" stroke="#000" stroke-width="3" stroke-linejoin="round"/><path d="M252 290 q26 20 32 50 q-16 14 -36 6 q2 -32 4 -56 z" fill="#222" stroke="#000" stroke-width="3" stroke-linejoin="round"/><path d="M168 268 q32 -16 64 0 q4 14 -2 30 q-30 6 -60 0 q-6 -16 -2 -30 z" fill="#1a1a1a" stroke="#000" stroke-width="3"/><line x1="188" y1="298" x2="192" y2="324" stroke="#aaa" stroke-width="2"/><line x1="212" y1="298" x2="208" y2="324" stroke="#aaa" stroke-width="2"/><rect x="178" y="372" width="44" height="34" rx="4" fill="#1a1a1a" stroke="#000" stroke-width="2"/></g>',
   50, 'common', 3),
  ('top-red-shirt', '빨간 셔츠', '쨍한 빨간 셔츠.', 'top',
   '<g><path d="M148 292 q52 -14 104 0 v144 q-52 14 -104 0 z" fill="#ff4b4b" stroke="#7a1a1a" stroke-width="3" stroke-linejoin="round"/><path d="M148 292 q-22 14 -28 36 q14 14 30 6 z" fill="#ff4b4b" stroke="#7a1a1a" stroke-width="3"/><path d="M252 292 q22 14 28 36 q-14 14 -30 6 z" fill="#ff4b4b" stroke="#7a1a1a" stroke-width="3"/><path d="M184 292 q16 10 32 0" stroke="#7a1a1a" stroke-width="3" fill="none"/></g>',
   40, 'common', 4),
  ('top-beige-jacket', '베이지 자켓', '단정한 베이지 자켓.', 'top',
   '<g><path d="M148 292 q52 -16 104 0 v146 q-52 14 -104 0 z" fill="#e8d5b0" stroke="#7a5300" stroke-width="3" stroke-linejoin="round"/><path d="M148 292 q-26 16 -32 46 q16 12 36 4 q-2 -28 -4 -50 z" fill="#e8d5b0" stroke="#7a5300" stroke-width="3"/><path d="M252 292 q26 16 32 46 q-16 12 -36 4 q2 -28 4 -50 z" fill="#e8d5b0" stroke="#7a5300" stroke-width="3"/><line x1="200" y1="296" x2="200" y2="436" stroke="#7a5300" stroke-width="2"/></g>',
   80, 'rare', 5),
  ('top-gr-hoodie', '로고 후디', '큰 GR 로고가 새겨진 후디.', 'top',
   '<g><path d="M148 290 q52 -16 104 0 v146 q-52 14 -104 0 z" fill="#c0c0c0" stroke="#444" stroke-width="3" stroke-linejoin="round"/><path d="M168 268 q32 -16 64 0 q4 14 -2 30 q-30 6 -60 0 q-6 -16 -2 -30 z" fill="#aaa" stroke="#444" stroke-width="3"/><text x="200" y="360" text-anchor="middle" font-size="32" font-weight="900" fill="#444">GR</text></g>',
   100, 'rare', 6);

-- ----- BOTTOM -------------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('bottom-white-shorts', '흰 반바지', '기본 흰 반바지.', 'bottom',
   '<g><path d="M152 412 q48 -10 96 0 q-2 26 -8 50 q-18 4 -32 0 q-14 4 -32 0 q-6 -24 -24 -50 z" fill="#ffffff" stroke="#777" stroke-width="3" stroke-linejoin="round"/><line x1="200" y1="416" x2="200" y2="460" stroke="#777" stroke-width="2"/></g>',
   0, 'starter', 1),
  ('bottom-blue-jeans', '청바지', '편한 데님 청바지.', 'bottom',
   '<g><path d="M150 412 q50 -12 100 0 q2 70 -4 138 q-16 8 -30 0 q2 -54 -4 -116 q-6 62 -4 116 q-14 8 -28 0 q-6 -68 -4 -138 z" fill="#3a5a8e" stroke="#1a2a4a" stroke-width="3" stroke-linejoin="round"/><line x1="200" y1="416" x2="200" y2="546" stroke="#1a2a4a" stroke-width="2"/><rect x="165" y="430" width="14" height="16" rx="2" fill="none" stroke="#1a2a4a" stroke-width="2"/><rect x="221" y="430" width="14" height="16" rx="2" fill="none" stroke="#1a2a4a" stroke-width="2"/></g>',
   0, 'starter', 2),
  ('bottom-cargo', '카고 팬츠', '주머니 많은 카고 팬츠.', 'bottom',
   '<g><path d="M150 412 q50 -12 100 0 q2 70 -4 138 q-16 8 -30 0 q2 -54 -4 -116 q-6 62 -4 116 q-14 8 -28 0 q-6 -68 -4 -138 z" fill="#5a6b3a" stroke="#2a3a1a" stroke-width="3" stroke-linejoin="round"/><rect x="160" y="470" width="22" height="26" rx="2" fill="none" stroke="#2a3a1a" stroke-width="2"/><rect x="218" y="470" width="22" height="26" rx="2" fill="none" stroke="#2a3a1a" stroke-width="2"/></g>',
   40, 'common', 3),
  ('bottom-red-trunks', '빨간 트렁크', '해변 분위기 빨간 트렁크.', 'bottom',
   '<g><path d="M150 412 q50 -10 100 0 q-2 30 -10 60 q-18 4 -34 0 q-16 4 -34 0 q-8 -30 -22 -60 z" fill="#c14040" stroke="#7a1a1a" stroke-width="3" stroke-linejoin="round"/><path d="M188 414 q12 10 24 0 q-2 6 -12 6 q-10 0 -12 -6 z" fill="#fff" stroke="#7a1a1a" stroke-width="2"/></g>',
   30, 'common', 4),
  ('bottom-black-jeans', '검정 슬림진', '슬림한 검정 진.', 'bottom',
   '<g><path d="M152 412 q48 -10 96 0 q4 70 -2 138 q-16 8 -28 0 q0 -56 -4 -112 q-4 56 -4 112 q-12 8 -28 0 q-6 -68 -2 -138 z" fill="#181818" stroke="#000" stroke-width="3" stroke-linejoin="round"/></g>',
   60, 'rare', 5);

-- ----- SHOES --------------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('shoes-white-sneakers', '흰 운동화', '기본 흰 운동화.', 'shoes',
   '<g><ellipse cx="184" cy="568" rx="28" ry="14" fill="#fff" stroke="#1f1f1f" stroke-width="3"/><ellipse cx="224" cy="568" rx="28" ry="14" fill="#fff" stroke="#1f1f1f" stroke-width="3"/><path d="M170 568 q14 -4 28 0" stroke="#bbb" stroke-width="2" fill="none"/><path d="M210 568 q14 -4 28 0" stroke="#bbb" stroke-width="2" fill="none"/></g>',
   0, 'starter', 1),
  ('shoes-black-sneakers', '검정 운동화', '깔끔한 검정 운동화.', 'shoes',
   '<g><ellipse cx="184" cy="568" rx="28" ry="14" fill="#1f1f1f" stroke="#000" stroke-width="3"/><ellipse cx="224" cy="568" rx="28" ry="14" fill="#1f1f1f" stroke="#000" stroke-width="3"/><path d="M156 568 q28 6 56 0" stroke="#fff" stroke-width="2" fill="none"/><path d="M196 568 q28 6 56 0" stroke="#fff" stroke-width="2" fill="none"/></g>',
   30, 'common', 2),
  ('shoes-checker-slipon', '체커 슬립온', '클래식 체커보드 슬립온.', 'shoes',
   '<g><ellipse cx="184" cy="568" rx="28" ry="14" fill="#fff" stroke="#1f1f1f" stroke-width="3"/><ellipse cx="224" cy="568" rx="28" ry="14" fill="#fff" stroke="#1f1f1f" stroke-width="3"/><g fill="#1f1f1f"><rect x="160" y="558" width="6" height="6"/><rect x="172" y="558" width="6" height="6"/><rect x="166" y="564" width="6" height="6"/><rect x="178" y="564" width="6" height="6"/><rect x="200" y="558" width="6" height="6"/><rect x="212" y="558" width="6" height="6"/><rect x="206" y="564" width="6" height="6"/><rect x="218" y="564" width="6" height="6"/><rect x="226" y="558" width="6" height="6"/><rect x="232" y="564" width="6" height="6"/></g></g>',
   60, 'common', 3),
  ('shoes-rainbow-runners', '무지개 런너', '에어 쿠션이 빛나는 런닝화.', 'shoes',
   '<g><ellipse cx="184" cy="568" rx="30" ry="16" fill="#1f1f1f" stroke="#000" stroke-width="3"/><ellipse cx="224" cy="568" rx="30" ry="16" fill="#1f1f1f" stroke="#000" stroke-width="3"/><path d="M156 572 q14 8 28 0" stroke="#58cc02" stroke-width="3" fill="none"/><path d="M196 572 q14 8 28 0" stroke="#58cc02" stroke-width="3" fill="none"/><path d="M158 568 q12 -6 24 0" stroke="#ff4b4b" stroke-width="2" fill="none"/><path d="M198 568 q12 -6 24 0" stroke="#1cb0f6" stroke-width="2" fill="none"/></g>',
   90, 'rare', 4),
  ('shoes-boots', '워커 부츠', '단단한 가죽 부츠.', 'shoes',
   '<g><path d="M156 544 h26 q4 14 4 28 q-14 6 -26 0 q-4 -14 -4 -28 z" fill="#3a2510" stroke="#1a0f00" stroke-width="3" stroke-linejoin="round"/><path d="M214 544 h26 q-0 14 -4 28 q-12 6 -26 0 q0 -14 4 -28 z" fill="#3a2510" stroke="#1a0f00" stroke-width="3" stroke-linejoin="round"/><line x1="160" y1="552" x2="180" y2="552" stroke="#fff" stroke-width="1.5"/><line x1="220" y1="552" x2="240" y2="552" stroke="#fff" stroke-width="1.5"/></g>',
   70, 'rare', 5);

-- ----- ACCESSORY ----------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('acc-black-cap', '검은 캡',     '챙이 긴 검정 캡.', 'accessory',
   '<g><path d="M112 110 q40 -34 88 -34 q48 0 88 34 q-4 18 -18 24 q-70 14 -140 0 q-14 -6 -18 -24 z" fill="#1f1f1f"/><path d="M82 124 q60 30 236 0 q-2 10 -10 16 q-108 22 -218 0 q-8 -6 -10 -16 z" fill="#1f1f1f"/></g>',
   50, 'common', 1),
  ('acc-beanie',    '검은 비니',   '따뜻한 검정 비니.', 'accessory',
   '<g><path d="M100 110 q44 -54 100 -54 q56 0 100 54 q-8 26 -100 26 q-92 0 -100 -26 z" fill="#1f1f1f"/><path d="M100 110 q100 26 200 0 q-2 18 -10 24 q-90 16 -180 0 q-8 -6 -10 -24 z" fill="#2a2a2a"/></g>',
   40, 'common', 2),
  ('acc-round-glasses', '둥근 안경', '클래식한 둥근 뿔테.', 'accessory',
   '<g fill="none" stroke="#1f1f1f" stroke-width="4"><circle cx="155" cy="172" r="24"/><circle cx="245" cy="172" r="24"/><line x1="179" y1="172" x2="221" y2="172"/></g>',
   30, 'common', 3),
  ('acc-sunglasses', '선글라스',  '쿨한 검정 선글라스.', 'accessory',
   '<g><rect x="124" y="156" width="62" height="32" rx="8" fill="#1f1f1f"/><rect x="214" y="156" width="62" height="32" rx="8" fill="#1f1f1f"/><line x1="186" y1="172" x2="214" y2="172" stroke="#1f1f1f" stroke-width="6"/><polygon points="130,162 150,162 146,168 128,168" fill="#666"/><polygon points="220,162 240,162 236,168 218,168" fill="#666"/></g>',
   70, 'rare', 4),
  ('acc-heart-shades', '하트 선글라스', '사랑이 가득한 하트 선글라스.', 'accessory',
   '<g fill="#ff86d0" stroke="#c43a73" stroke-width="3"><path d="M124 158 c-8 -10 12 -16 32 -2 c20 -14 40 -8 32 2 c-4 18 -32 38 -32 38 c0 0 -28 -20 -32 -38 z"/><path d="M214 158 c-8 -10 12 -16 32 -2 c20 -14 40 -8 32 2 c-4 18 -32 38 -32 38 c0 0 -28 -20 -32 -38 z"/></g>',
   100, 'rare', 5),
  ('acc-camera', '카메라', '목에 건 빈티지 카메라.', 'accessory',
   '<g><line x1="172" y1="270" x2="160" y2="350" stroke="#5a3a1a" stroke-width="3"/><line x1="228" y1="270" x2="240" y2="350" stroke="#5a3a1a" stroke-width="3"/><rect x="158" y="340" width="84" height="56" rx="8" fill="#1f1f1f" stroke="#000" stroke-width="3"/><circle cx="200" cy="368" r="18" fill="#444" stroke="#000" stroke-width="3"/><circle cx="200" cy="368" r="10" fill="#222"/><rect x="226" y="346" width="10" height="6" rx="1" fill="#666"/></g>',
   120, 'rare', 6),
  ('acc-crown', '왕관',   '도토리 왕!', 'accessory',
   '<g><polygon points="120,86 138,52 170,80 200,40 230,80 262,52 280,86" fill="#ffc800" stroke="#7a5300" stroke-width="4" stroke-linejoin="round"/><rect x="120" y="78" width="160" height="14" rx="2" fill="#d39400" stroke="#7a5300" stroke-width="4"/><circle cx="138" cy="56" r="6" fill="#ff86d0" stroke="#7a1a1a" stroke-width="2"/><circle cx="200" cy="46" r="6" fill="#1cb0f6" stroke="#075f8a" stroke-width="2"/><circle cx="262" cy="56" r="6" fill="#ce82ff" stroke="#7a1a7a" stroke-width="2"/></g>',
   250, 'epic', 7);
