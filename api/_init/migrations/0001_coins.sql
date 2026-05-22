-- =============================================================
-- Migration 0001 — 통화 시스템
--
-- 이미 schema.sql 로 DB 를 만들어 둔 경우, 이 파일을 phpMyAdmin 에서
-- 그대로 실행하면 통화 시스템에 필요한 컬럼/테이블이 추가된다.
-- (새로 설치하는 경우 schema.sql 최신본이 이미 포함하고 있어 실행 불필요)
-- =============================================================

ALTER TABLE users
  ADD COLUMN coins INT UNSIGNED NOT NULL DEFAULT 0 AFTER xp;

CREATE TABLE IF NOT EXISTS coin_ledger (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED       NOT NULL,
    delta           INT                NOT NULL,    -- 양수=획득, 음수=차감
    reason          VARCHAR(40)        NOT NULL,    -- 'lesson_pass' | 'lesson_retry' | 'streak_bonus' | 'purchase' | ...
    ref_type        VARCHAR(20)        NULL,        -- 'lesson' | 'item' | ...
    ref_id          INT UNSIGNED       NULL,
    balance_after   INT UNSIGNED       NOT NULL,
    created_at      DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_coin_ledger_user_date (user_id, created_at),
    CONSTRAINT fk_coin_ledger_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
