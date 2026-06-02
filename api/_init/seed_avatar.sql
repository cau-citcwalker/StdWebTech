-- =============================================================
-- FinEdu — 아바타 아이템 시드 (메타데이터만)
--
--   슬롯: hair · top · bottom
--     hair   : 헤어 PNG → /assets/img/items/hair/{slug}.png   (clipPath 로 상단만 노출)
--     top    : 상의 PNG → /assets/img/items/top/{slug}.png
--     bottom : 하의 PNG → /assets/img/items/bottom/{slug}.png
--
--   PNG 는 viewBox 0 0 400 600 의 전신 frame, 배경 alpha 0.
--   각 슬롯이 비어있어도 base 캐릭터(/assets/img/character-base.png) 가 깔린다.
--
--   sort_order = 0 = "비어 있는" sentinel (예: hair-bald, 자동 장착 sentinel)
-- =============================================================

SET NAMES utf8mb4;

-- ----- TOP (상의) -----------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('top-cream-tee',     '아이보리 티',    '깔끔한 아이보리 티셔츠.',     'top',   0, 'starter', 1),
  ('top-tank',          '화이트 탱크',    '심플한 흰 탱크탑.',           'top',   0, 'starter', 2),
  ('top-blue-shirt',    '하늘 셔츠',      '오버핏 라이트 블루 셔츠.',    'top',  50, 'common',  3),
  ('top-gray-hoodie',   '그레이 후디',    '집업 그레이 후디.',           'top', 100, 'rare',    4);

-- ----- BOTTOM (하의) --------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('bottom-shorts',     '흰 반바지',      '심플한 흰 반바지.',           'bottom',   0, 'starter', 1),
  ('bottom-sweats',     '그레이 스웻',    '편한 그레이 스웻팬츠.',       'bottom',   0, 'starter', 2),
  ('bottom-black-pants','블랙 슬랙스',    '깔끔한 블랙 슬랙스.',         'bottom',  60, 'common',  3),
  ('bottom-blue-jeans', '데님 진',        '워싱 청바지.',                'bottom',  80, 'rare',    4);

-- ----- HAIR (헤어) ----------------------------------------------
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
