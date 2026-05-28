<?php
/**
 * FinEdu — 친구 관계 헬퍼
 */

declare(strict_types=1);

function are_friends(int $a, int $b): bool
{
    if ($a === $b) return false;
    $stmt = db()->prepare(
        "SELECT 1 FROM friendships
         WHERE status = 'accepted'
           AND ((requester_id = :a AND addressee_id = :b)
             OR (requester_id = :b AND addressee_id = :a))
         LIMIT 1"
    );
    $stmt->execute([':a' => $a, ':b' => $b]);
    return $stmt->fetchColumn() !== false;
}

function pending_between(int $requester, int $addressee): ?array
{
    $stmt = db()->prepare(
        "SELECT id, status FROM friendships
         WHERE requester_id = :r AND addressee_id = :a
         LIMIT 1"
    );
    $stmt->execute([':r' => $requester, ':a' => $addressee]);
    $row = $stmt->fetch();
    return $row === false ? null : $row;
}

function friend_summary_row(array $u): array
{
    return [
        'id'           => (int)$u['id'],
        'username'     => $u['username'],
        'display_name' => $u['display_name'],
        'xp'           => (int)$u['xp'],
        'streak_days'  => (int)$u['streak_days'],
        'outfit_slug'  => $u['outfit_slug'] ?? null,
    ];
}
