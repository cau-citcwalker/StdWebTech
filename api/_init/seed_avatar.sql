-- =============================================================
-- FinEdu — 아바타 아이템 시드 (메타데이터만)
--
--   슬롯: outfit · hair
--   outfit : 풀세트 painterly JPEG → /assets/img/items/outfit/{slug}.jpeg
--   hair   : 머리 스타일 JPEG    → /assets/img/items/hair/{slug}.jpeg
--            (mascot.js 에서 clip-path 로 상단만 잘라내고 mix-blend-mode:
--             multiply 로 흰 배경 통과)
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

-- ----- HAIR -----------------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('hair-bald',             '대머리',         '깔끔한 민머리.',                       'hair',   0, 'starter', 0),
  ('hair-black-bowl',       '검정 단발',      '클래식한 검정 단발컷.',                'hair',   0, 'starter', 1),
  ('hair-brown-sidepart',   '갈색 사이드',    '단정한 갈색 사이드 파트.',             'hair',   0, 'starter', 2),
  ('hair-black-messy',      '검정 헝클',      '자연스럽게 헝클어진 검정 머리.',       'hair',  40, 'common',  3),
  ('hair-brown-swept',      '갈색 스웹',      '시원하게 넘긴 갈색 머리.',             'hair',  50, 'common',  4),
  ('hair-black-spiky',      '검정 스파이키',  '뾰족하게 솟은 검정 스파이키.',         'hair',  60, 'common',  5),
  ('hair-black-flat',       '검정 플랫',      '단정한 검정 플랫 헤어.',               'hair',  50, 'common',  6),
  ('hair-brown-shaggy',     '갈색 셰기',      '느낌 있는 갈색 셰기컷.',               'hair', 100, 'rare',    7),
  ('hair-brown-long',       '갈색 장발',      '낭만적인 갈색 장발.',                  'hair', 150, 'epic',    8);
