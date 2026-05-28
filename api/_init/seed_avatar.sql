-- =============================================================
-- FinEdu — 휴머노이드 아바타 아이템 시드 (메타데이터만)
--
--   슬롯: hair · face · top · bottom · shoes · accessory
--   SVG fragment 는 /assets/img/items/{slot}/{slug}.svg 에 별도 파일로 둔다.
--   이 시드는 슬러그/이름/가격/희귀도/정렬만 채운다.
--
--   sort_order = 0 = "비어 있는" 시드 (예: hair-bald) → 자동 장착 제외
-- =============================================================

SET NAMES utf8mb4;

-- ----- HAIR ---------------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('hair-bald',        '대머리',     '깔끔한 민머리.',           'hair',   0, 'starter', 0),
  ('hair-black-bob',   '검은 단발',   '클래식한 검정 단발 머리.', 'hair',   0, 'starter', 1),
  ('hair-brown-bob',   '갈색 단발',   '따뜻한 갈색 단발 머리.',   'hair',   0, 'starter', 2),
  ('hair-blonde-pixy', '노란 픽시',   '발랄한 노랑 픽시컷.',       'hair',  30, 'common',  3),
  ('hair-pink-twin',   '분홍 양갈래', '귀여운 분홍 양갈래.',       'hair',  60, 'rare',    4),
  ('hair-white-long',  '백발 장발',   '신비로운 백발 장발.',       'hair', 120, 'epic',    5);

-- ----- TOP ----------------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('top-white-tank',    '흰 탱크탑',    '기본 흰 탱크탑.',           'top',   0, 'starter', 1),
  ('top-gray-tee',      '회색 티셔츠',  '편한 회색 반팔.',           'top',   0, 'starter', 2),
  ('top-black-hoodie',  '검은 후디',    '쿨한 검정 후디.',           'top',  50, 'common',  3),
  ('top-red-shirt',     '빨간 셔츠',    '쨍한 빨간 셔츠.',           'top',  40, 'common',  4),
  ('top-beige-jacket',  '베이지 자켓',  '단정한 베이지 자켓.',       'top',  80, 'rare',    5),
  ('top-gr-hoodie',     '로고 후디',    '큰 GR 로고가 새겨진 후디.', 'top', 100, 'rare',    6);

-- ----- BOTTOM -------------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('bottom-white-shorts', '흰 반바지',     '기본 흰 반바지.',          'bottom',  0, 'starter', 1),
  ('bottom-blue-jeans',   '청바지',        '편한 데님 청바지.',        'bottom',  0, 'starter', 2),
  ('bottom-cargo',        '카고 팬츠',     '주머니 많은 카고 팬츠.',   'bottom', 40, 'common',  3),
  ('bottom-red-trunks',   '빨간 트렁크',   '해변 분위기 빨간 트렁크.', 'bottom', 30, 'common',  4),
  ('bottom-black-jeans',  '검정 슬림진',   '슬림한 검정 진.',          'bottom', 60, 'rare',    5);

-- ----- SHOES --------------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('shoes-white-sneakers',   '흰 운동화',     '기본 흰 운동화.',                'shoes',  0, 'starter', 1),
  ('shoes-black-sneakers',   '검정 운동화',   '깔끔한 검정 운동화.',            'shoes', 30, 'common',  2),
  ('shoes-checker-slipon',   '체커 슬립온',   '클래식 체커보드 슬립온.',        'shoes', 60, 'common',  3),
  ('shoes-rainbow-runners',  '무지개 런너',   '에어 쿠션이 빛나는 런닝화.',     'shoes', 90, 'rare',    4),
  ('shoes-boots',            '워커 부츠',     '단단한 가죽 부츠.',              'shoes', 70, 'rare',    5);

-- ----- ACCESSORY ----------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('acc-black-cap',     '검은 캡',       '챙이 긴 검정 캡.',                  'accessory',  50, 'common', 1),
  ('acc-beanie',        '검은 비니',     '따뜻한 검정 비니.',                 'accessory',  40, 'common', 2),
  ('acc-round-glasses', '둥근 안경',     '클래식한 둥근 뿔테.',               'accessory',  30, 'common', 3),
  ('acc-sunglasses',    '선글라스',      '쿨한 검정 선글라스.',               'accessory',  70, 'rare',   4),
  ('acc-heart-shades',  '하트 선글라스', '사랑이 가득한 하트 선글라스.',      'accessory', 100, 'rare',   5),
  ('acc-camera',        '카메라',        '목에 건 빈티지 카메라.',            'accessory', 120, 'rare',   6),
  ('acc-crown',         '왕관',          '오늘의 학습왕!',                    'accessory', 250, 'epic',   7);
