-- =============================================================
-- FinEdu — 아바타 아이템 시드 (메타데이터만)
--
--   슬롯: hair · top · bottom (각 3종 = 총 9개)
--   슬러그 규약: {slot}-{N}, N=1..3.  mascot.js 가 슬러그 끝 숫자를 추출해
--               combos/hair{H}+top{T}+pants{P}.png 1장으로 렌더.
--
--   기본 지급 (starter) 아이템은 없음 — 모두 마켓에서 코인으로 구매.
--   첫 레슨을 완료하면 코인이 들어와 첫 아이템을 살 수 있게 됨.
-- =============================================================

SET NAMES utf8mb4;

-- ----- HAIR (헤어) ----------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('hair-1', '갈색 단발', '',     'hair',  40, 'common', 1),
  ('hair-2', '검정 사이드', '',   'hair',  60, 'common', 2),
  ('hair-3', '검정 헝클', '',     'hair', 100, 'rare',   3);

-- ----- TOP (상의) -----------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('top-1', '아이보리 로고 티', '', 'top',  40, 'common', 1),
  ('top-2', '라이트 블루 셔츠', '', 'top',  60, 'common', 2),
  ('top-3', '와인 그래픽 티',   '', 'top', 100, 'rare',   3);

-- ----- BOTTOM (하의) --------------------------------------------
INSERT INTO items (slug, name, description, slot, price, rarity, sort_order) VALUES
  ('bottom-1', '그레이 스웻팬츠', '', 'bottom',  40, 'common', 1),
  ('bottom-2', '블루 데님',       '', 'bottom',  60, 'common', 2),
  ('bottom-3', '블랙 슬랙스',     '', 'bottom', 100, 'rare',   3);
