-- =============================================================
-- Migration 0002 — 캐릭터 아이템 / 인벤토리 / 장비 슬롯
-- =============================================================

SET NAMES utf8mb4;

-- 아이템 카탈로그
CREATE TABLE IF NOT EXISTS items (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    slug            VARCHAR(40)        NOT NULL,
    name            VARCHAR(80)        NOT NULL,
    description     VARCHAR(255)       NULL,
    slot            VARCHAR(20)        NOT NULL,        -- 'hat' | 'glasses' | 'scarf' | 'background'
    svg_markup      TEXT               NOT NULL,        -- 인라인 SVG 조각 (viewBox 320x320 기준)
    price           INT UNSIGNED       NOT NULL DEFAULT 0,
    rarity          VARCHAR(20)        NOT NULL DEFAULT 'common', -- 'starter' | 'common' | 'rare' | 'epic'
    sort_order      INT UNSIGNED       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_item_slug (slug),
    KEY idx_item_slot (slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 사용자 인벤토리
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

-- 사용자 장비 (슬롯당 하나)
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
