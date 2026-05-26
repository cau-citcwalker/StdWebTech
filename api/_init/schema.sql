-- =============================================================
-- FinEdu — DB 스키마 (InfinityFree / MySQL 5.7+)
--
-- InfinityFree 의 phpMyAdmin 에서 그대로 실행하면 된다.
-- 이미 만든 테이블이 있을 경우 DROP TABLE 후 다시 실행하면 깨끗하게 재생성됨.
-- =============================================================

SET NAMES utf8mb4;

-- -------------------------------------------------------------
-- 사용자
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    username        VARCHAR(40)        NOT NULL,
    email           VARCHAR(190)       NOT NULL,
    password_hash   VARCHAR(255)       NOT NULL,
    display_name    VARCHAR(60)        NOT NULL,
    xp              INT UNSIGNED       NOT NULL DEFAULT 0,
    coins           INT UNSIGNED       NOT NULL DEFAULT 0,
    streak_days     INT UNSIGNED       NOT NULL DEFAULT 0,
    last_active_at  DATETIME           DEFAULT NULL,
    created_at      DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_users_username (username),
    UNIQUE KEY uniq_users_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 코인 변동 원장 (감사용)
CREATE TABLE IF NOT EXISTS coin_ledger (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED       NOT NULL,
    delta           INT                NOT NULL,
    reason          VARCHAR(40)        NOT NULL,
    ref_type        VARCHAR(20)        NULL,
    ref_id          INT UNSIGNED       NULL,
    balance_after   INT UNSIGNED       NOT NULL,
    created_at      DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_coin_ledger_user_date (user_id, created_at),
    CONSTRAINT fk_coin_ledger_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 학습 단원 (코스 묶음)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS units (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    slug            VARCHAR(60)        NOT NULL,
    title           VARCHAR(120)       NOT NULL,
    subtitle        VARCHAR(255)       NULL,
    sort_order      INT UNSIGNED       NOT NULL DEFAULT 0,
    color           VARCHAR(20)        NOT NULL DEFAULT '#58cc02',
    PRIMARY KEY (id),
    UNIQUE KEY uniq_units_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 레슨
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lessons (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    unit_id         INT UNSIGNED       NOT NULL,
    slug            VARCHAR(60)        NOT NULL,
    title           VARCHAR(120)       NOT NULL,
    summary         VARCHAR(255)       NULL,
    icon            VARCHAR(40)        NOT NULL DEFAULT 'spark',
    sort_order      INT UNSIGNED       NOT NULL DEFAULT 0,
    xp_reward       INT UNSIGNED       NOT NULL DEFAULT 10,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_lesson_unit_slug (unit_id, slug),
    KEY idx_lesson_unit (unit_id),
    CONSTRAINT fk_lesson_unit FOREIGN KEY (unit_id)
        REFERENCES units(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 문제
--   type:
--     'multiple_choice'  보기 중 하나 선택 (options JSON 배열, answer 인덱스)
--     'true_false'       O/X
--     'fill_blank'       빈칸 채우기 (answer 문자열)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    lesson_id       INT UNSIGNED       NOT NULL,
    type            VARCHAR(24)        NOT NULL,
    prompt          TEXT               NOT NULL,
    options         TEXT               NULL,       -- JSON 배열 (또는 NULL)
    answer          VARCHAR(255)       NOT NULL,
    explanation     TEXT               NULL,
    sort_order      INT UNSIGNED       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_questions_lesson (lesson_id),
    CONSTRAINT fk_questions_lesson FOREIGN KEY (lesson_id)
        REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 사용자 레슨 진행도
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED       NOT NULL,
    lesson_id       INT UNSIGNED       NOT NULL,
    completed_at    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score_pct       TINYINT UNSIGNED   NOT NULL DEFAULT 0,
    correct_count   SMALLINT UNSIGNED  NOT NULL DEFAULT 0,
    total_count     SMALLINT UNSIGNED  NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_user_lesson (user_id, lesson_id),
    KEY idx_progress_user (user_id),
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id)
        REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 캐릭터 아이템 / 인벤토리 / 장비
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS items (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    slug            VARCHAR(40)        NOT NULL,
    name            VARCHAR(80)        NOT NULL,
    description     VARCHAR(255)       NULL,
    slot            VARCHAR(20)        NOT NULL,
    svg_markup      TEXT               NOT NULL,
    price           INT UNSIGNED       NOT NULL DEFAULT 0,
    rarity          VARCHAR(20)        NOT NULL DEFAULT 'common',
    sort_order      INT UNSIGNED       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_item_slug (slug),
    KEY idx_item_slot (slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_items (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED       NOT NULL,
    item_id         INT UNSIGNED       NOT NULL,
    acquired_at     DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_user_item (user_id, item_id),
    KEY idx_user_items_user (user_id),
    CONSTRAINT fk_user_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_items_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_equipment (
    user_id         INT UNSIGNED       NOT NULL,
    slot            VARCHAR(20)        NOT NULL,
    item_id         INT UNSIGNED       NOT NULL,
    equipped_at     DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, slot),
    KEY idx_equipment_user (user_id),
    CONSTRAINT fk_equipment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_equipment_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 친구 관계
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS friendships (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    requester_id    INT UNSIGNED       NOT NULL,
    addressee_id    INT UNSIGNED       NOT NULL,
    status          VARCHAR(16)        NOT NULL DEFAULT 'pending',
    created_at      DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at      DATETIME           NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_friendship_pair (requester_id, addressee_id),
    KEY idx_addressee_status (addressee_id, status),
    KEY idx_requester_status (requester_id, status),
    CONSTRAINT fk_friend_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_addressee FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 알림
--   type: 'friend_request' | 'friend_accepted' | 'system' | 'streak' | 'league'
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED       NOT NULL,
    type            VARCHAR(24)        NOT NULL,
    title           VARCHAR(120)       NOT NULL,
    body            VARCHAR(255)       NULL,
    link            VARCHAR(255)       NULL,
    is_read         TINYINT(1)         NOT NULL DEFAULT 0,
    created_at      DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at         DATETIME           NULL,
    PRIMARY KEY (id),
    KEY idx_notif_user_read (user_id, is_read, created_at),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
