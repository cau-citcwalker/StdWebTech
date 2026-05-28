-- =============================================================
-- FinEdu — 아바타 아이템 시드 (메타데이터만)
--
--   슬롯: outfit · accessory
--   outfit : 풀세트 painterly JPEG → /assets/img/items/outfit/{slug}.jpeg
--   accessory : SVG overlay → /assets/img/items/accessory/{slug}.svg
--
--   sort_order = 0 = "비어 있는" 시드 (자동 장착 제외용 sentinel)
-- =============================================================

SET NAMES utf8mb4;

-- ----- OUTFIT (full set) ---------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('outfit-cream-tee',        '로고 티 세트',   '아이보리 로고 티에 흰 반바지.',         'outfit',   0, 'starter', 1),
  ('outfit-tank-sweats',      '탱크 + 스웻',    '흰 탱크탑에 그레이 스웻팬츠.',          'outfit',   0, 'starter', 2),
  ('outfit-blue-shirt',       '하늘 셔츠',      '오버핏 라이트 블루 셔츠 + 흰 반바지.',  'outfit',  50, 'common',  3),
  ('outfit-black-pants',      '블랙 슬랙스',    '흰 탱크탑에 깔끔한 블랙 팬츠.',         'outfit',  60, 'common',  4),
  ('outfit-gray-hoodie',      '그레이 후디',    '집업 후디 + 흰 반바지의 댄디 룩.',      'outfit', 100, 'rare',    5),
  ('outfit-blue-jeans',       '데님 룩',        '흰 탱크탑 + 워싱 청바지.',              'outfit',  80, 'rare',    6);

-- ----- ACCESSORY ----------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('acc-black-cap',     '검은 캡',       '챙이 긴 검정 캡.',                  'accessory',  50, 'common', 1),
  ('acc-beanie',        '검은 비니',     '따뜻한 검정 비니.',                 'accessory',  40, 'common', 2),
  ('acc-round-glasses', '둥근 안경',     '클래식한 둥근 뿔테.',               'accessory',  30, 'common', 3),
  ('acc-sunglasses',    '선글라스',      '쿨한 검정 선글라스.',               'accessory',  70, 'rare',   4),
  ('acc-heart-shades',  '하트 선글라스', '사랑이 가득한 하트 선글라스.',      'accessory', 100, 'rare',   5),
  ('acc-camera',        '카메라',        '목에 건 빈티지 카메라.',            'accessory', 120, 'rare',   6),
  ('acc-crown',         '왕관',          '오늘의 학습왕!',                    'accessory', 250, 'epic',   7);
