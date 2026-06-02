-- =============================================================
-- FinEdu — 아바타 아이템 시드 (메타데이터만)
--
--   슬롯: hair · top · bottom (각 3종 = 총 9개)
--   슬러그 규약: {slot}-{N}, N=1..3.  mascot.js 가 슬러그 끝 숫자를 추출해
--               combos/hair{H}+top{T}+pants{P}.png 1장으로 렌더.
--
--   sort_order = 0 = "비어 있는" sentinel — 현재는 사용 안 함 (대머리 sentinel 도 제거).
-- =============================================================

SET NAMES utf8mb4;

-- ----- HAIR (헤어) ----------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('hair-1', '갈색 단발', '내추럴한 갈색 단발컷.',     'hair',   0, 'starter', 1),
  ('hair-2', '검정 사이드', '단정한 검정 사이드 파트.', 'hair',  50, 'common',  2),
  ('hair-3', '검정 헝클', '자연스럽게 헝클어진 검정.',   'hair', 100, 'rare',    3);

-- ----- TOP (상의) -----------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('top-1', '아이보리 로고 티', '아이보리 베이스 그래픽 티.', 'top',   0, 'starter', 1),
  ('top-2', '라이트 블루 셔츠', '오버핏 하늘 셔츠.',         'top',  50, 'common',  2),
  ('top-3', '와인 그래픽 티',   '와인 컬러 그래픽 티.',        'top', 100, 'rare',    3);

-- ----- BOTTOM (하의) --------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('bottom-1', '그레이 스웻팬츠', '편한 그레이 스웻팬츠.',     'bottom',   0, 'starter', 1),
  ('bottom-2', '블루 데님',       '워싱 청바지.',               'bottom',  60, 'common',  2),
  ('bottom-3', '블랙 슬랙스',     '깔끔한 블랙 슬랙스.',         'bottom', 100, 'rare',    3);
