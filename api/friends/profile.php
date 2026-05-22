<?php
/**
 * GET /api/friends/profile.php?id=N
 *
 *   친구의 공개 프로필. 본인이 친구인 사용자만 볼 수 있음 (또는 본인 자신).
 *   - display_name / username / xp / streak_days / 가입일
 *   - equipped: { slot: item_id }
 *   - items 카탈로그 (마스코트 합성용)
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/character.php';
require __DIR__ . '/../_lib/friends.php';

require_method('GET');
$uid = require_login();

$targetId = (int)($_GET['id'] ?? 0);
if ($targetId <= 0) json_error('id 가 필요해요.', 422);

if ($targetId !== $uid && !are_friends($uid, $targetId)) {
    json_error('이 프로필은 친구만 볼 수 있어요.', 403);
}

$target = load_user_by_id($targetId);
if ($target === null) json_error('사용자를 찾을 수 없어요.', 404);

json_ok([
    'user' => [
        'id'           => (int)$target['id'],
        'username'     => $target['username'],
        'display_name' => $target['display_name'],
        'xp'           => (int)$target['xp'],
        'streak_days'  => (int)$target['streak_days'],
        'joined_at'    => $target['created_at'],
        'is_self'      => $targetId === $uid,
    ],
    'equipped' => user_equipment($targetId),
    'items'    => list_items(),
]);
