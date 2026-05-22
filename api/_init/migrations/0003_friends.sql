-- =============================================================
-- Migration 0003 — 친구 관계
--
-- 단방향 신청 → 양방향 친구 (수락) 모델.
-- 동일한 (requester, addressee) 쌍은 한 번만 존재.
-- =============================================================

CREATE TABLE IF NOT EXISTS friendships (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    requester_id    INT UNSIGNED       NOT NULL,
    addressee_id    INT UNSIGNED       NOT NULL,
    status          VARCHAR(16)        NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
    created_at      DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at      DATETIME           NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_friendship_pair (requester_id, addressee_id),
    KEY idx_addressee_status (addressee_id, status),
    KEY idx_requester_status (requester_id, status),
    CONSTRAINT fk_friend_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_addressee FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
