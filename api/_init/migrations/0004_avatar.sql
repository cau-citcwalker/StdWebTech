-- =============================================================
-- Migration 0004 — 마스코트(다람쥐) → 휴머노이드 아바타 전환
--
-- 슬롯 체계 변경:
--   기존: hat / glasses / scarf / background  (다람쥐 도토리)
--   신규: hair / face / top / bottom / shoes / accessory  (인간형 캐릭터)
--
-- 기존 아이템 데이터를 모두 비운다. user_items / user_equipment 는
-- 외래키 ON DELETE CASCADE 로 자동 정리.
--
-- 그 다음 seed_avatar.sql 을 실행해서 새 아이템을 채운다.
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE user_equipment;
TRUNCATE TABLE user_items;
TRUNCATE TABLE items;

SET FOREIGN_KEY_CHECKS = 1;

-- 안내: 본 마이그레이션 이후 seed_avatar.sql 을 phpMyAdmin 에서 실행하세요.
