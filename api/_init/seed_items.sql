-- =============================================================
-- FinEdu — 아이템 시드 데이터
--
-- viewBox 는 마스코트와 같은 320x320 기준. svg_markup 은 SVG 조각이며
-- 마스코트 위에 합성된다.
-- ============================================================

SET NAMES utf8mb4;

-- ----- hat 슬롯 ------------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('yellow-beanie',  '노란 빵모자', '귀여운 노란 빵모자.', 'hat',
   '<g><path d="M118 70 C 118 30, 214 30, 214 70 Q 214 78 166 78 Q 118 78 118 70 Z" fill="#ffc800" stroke="#7a5300" stroke-width="6" stroke-linejoin="round"/><circle cx="166" cy="30" r="10" fill="#fff3c2" stroke="#7a5300" stroke-width="5"/></g>',
   0, 'starter', 1),

  ('graduation-cap', '학사모',     '졸업식의 그 모자.',  'hat',
   '<g><rect x="120" y="58" width="92" height="10" rx="2" fill="#1f1f1f"/><polygon points="106,58 226,58 196,38 134,38" fill="#1f1f1f"/><circle cx="166" cy="48" r="5" fill="#ffc800" stroke="#7a5300" stroke-width="2"/><path d="M166 48 L196 38 L196 50" stroke="#ffc800" stroke-width="3" fill="none"/></g>',
   80, 'rare', 2),

  ('santa-hat',      '산타 모자',  '빨간 산타 모자.',     'hat',
   '<g><path d="M118 70 Q 130 30 200 38 L 226 58 Q 220 70 166 70 Q 130 70 118 70 Z" fill="#ff4b4b" stroke="#7a1a1a" stroke-width="5" stroke-linejoin="round"/><rect x="118" y="62" width="108" height="14" rx="6" fill="#ffffff" stroke="#7a1a1a" stroke-width="4"/><circle cx="204" cy="36" r="9" fill="#ffffff" stroke="#7a1a1a" stroke-width="4"/></g>',
   40, 'common', 3),

  ('crown',          '왕관',       '도토리 왕!',          'hat',
   '<g><polygon points="120,68 130,38 150,58 166,32 182,58 202,38 212,68" fill="#ffc800" stroke="#7a5300" stroke-width="5" stroke-linejoin="round"/><rect x="120" y="62" width="92" height="10" rx="2" fill="#d39400" stroke="#7a5300" stroke-width="4"/><circle cx="130" cy="38" r="5" fill="#ff86d0" stroke="#7a1a1a" stroke-width="2"/><circle cx="166" cy="32" r="5" fill="#1cb0f6" stroke="#075f8a" stroke-width="2"/><circle cx="202" cy="38" r="5" fill="#ce82ff" stroke="#7a1a7a" stroke-width="2"/></g>',
   200, 'epic', 4);

-- ----- glasses 슬롯 -------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('round-glasses',  '둥근 안경',  '클래식한 둥근 뿔테.', 'glasses',
   '<g fill="none" stroke="#1f1f1f" stroke-width="5"><circle cx="142" cy="116" r="20"/><circle cx="190" cy="116" r="20"/><line x1="162" y1="116" x2="170" y2="116"/></g>',
   0, 'starter', 1),

  ('sunglasses',     '선글라스',   '쿨한 도토리.',         'glasses',
   '<g><rect x="120" y="102" width="44" height="28" rx="6" fill="#1f1f1f" stroke="#1f1f1f" stroke-width="3"/><rect x="168" y="102" width="44" height="28" rx="6" fill="#1f1f1f" stroke="#1f1f1f" stroke-width="3"/><line x1="164" y1="116" x2="168" y2="116" stroke="#1f1f1f" stroke-width="6"/><polygon points="124,108 158,108 156,114 124,114" fill="#777"/></g>',
   60, 'common', 2),

  ('heart-glasses',  '하트 선글라스', '사랑하는 도토리.', 'glasses',
   '<g fill="#ff86d0" stroke="#c43a73" stroke-width="3"><path d="M122 102 C 116 96, 130 92, 142 104 C 154 92, 168 96, 162 102 C 158 116, 142 130, 142 130 C 142 130, 126 116, 122 102 Z"/><path d="M170 102 C 164 96, 178 92, 190 104 C 202 92, 216 96, 210 102 C 206 116, 190 130, 190 130 C 190 130, 174 116, 170 102 Z"/></g>',
   120, 'rare', 3);

-- ----- scarf 슬롯 ---------------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('red-scarf',      '빨간 스카프', '따끈따끈한 스카프.', 'scarf',
   '<g><ellipse cx="166" cy="186" rx="64" ry="14" fill="#ff4b4b" stroke="#7a1a1a" stroke-width="5"/><path d="M156 195 L 148 240 L 168 240 L 168 195 Z" fill="#ff4b4b" stroke="#7a1a1a" stroke-width="5" stroke-linejoin="round"/><path d="M174 195 L 178 226 L 192 222 L 190 195 Z" fill="#c43a3a" stroke="#7a1a1a" stroke-width="5" stroke-linejoin="round"/></g>',
   0, 'starter', 1),

  ('striped-scarf',  '줄무늬 머플러', '겨울 도토리.',     'scarf',
   '<g><rect x="100" y="178" width="132" height="20" rx="10" fill="#1cb0f6" stroke="#075f8a" stroke-width="4"/><rect x="100" y="178" width="132" height="6" fill="#ffffff" opacity="0.9"/><rect x="100" y="190" width="132" height="6" fill="#ffffff" opacity="0.7"/><path d="M150 198 L 142 248 L 162 248 L 162 198 Z" fill="#1cb0f6" stroke="#075f8a" stroke-width="4" stroke-linejoin="round"/></g>',
   70, 'common', 2),

  ('gold-bow',       '황금 리본',  '특별한 날의 도토리.', 'scarf',
   '<g><path d="M132 192 Q 120 178 130 174 Q 156 184 166 186 Q 156 192 132 192 Z" fill="#ffd14d" stroke="#7a5300" stroke-width="4"/><path d="M200 192 Q 212 178 202 174 Q 176 184 166 186 Q 176 192 200 192 Z" fill="#ffd14d" stroke="#7a5300" stroke-width="4"/><rect x="160" y="180" width="12" height="14" rx="2" fill="#d39400" stroke="#7a5300" stroke-width="3"/></g>',
   140, 'rare', 3);

-- ----- background 슬롯 ----------------------------------------
INSERT INTO items (slug, name, description, slot, svg_markup, price, rarity, sort_order) VALUES
  ('stars-bg',       '별빛 배경',  '반짝반짝 별이 떠요.', 'background',
   '<g fill="#ffc800"><circle cx="30" cy="50" r="4"/><circle cx="290" cy="80" r="3"/><circle cx="60" cy="170" r="3"/><circle cx="270" cy="240" r="4"/><circle cx="40" cy="280" r="3"/><path d="M120 30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"/><path d="M250 150 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"/></g>',
   50, 'common', 1),

  ('rainbow-bg',     '무지개 배경', '오늘은 화려한 날.',   'background',
   '<g fill="none" stroke-width="14" opacity="0.65"><path d="M-20 320 a200 200 0 0 1 360 0" stroke="#ff4b4b"/><path d="M0 320 a180 180 0 0 1 320 0" stroke="#ffc800"/><path d="M20 320 a160 160 0 0 1 280 0" stroke="#58cc02"/><path d="M40 320 a140 140 0 0 1 240 0" stroke="#1cb0f6"/><path d="M60 320 a120 120 0 0 1 200 0" stroke="#ce82ff"/></g>',
   90, 'rare', 2);
