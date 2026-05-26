<?php
/**
 * POST /api/friends/accept.php
 *   body: { request_id: int }
 *
 *   - 본인이 addressee 인 pending 만 수락 가능
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/notify.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$rid = (int)($body['request_id'] ?? 0);
if ($rid <= 0) json_error('request_id 가 필요해요.', 422);

$stmt = db()->prepare(
    "SELECT id, status, requester_id FROM friendships
     WHERE id = :id AND addressee_id = :uid LIMIT 1"
);
$stmt->execute([':id' => $rid, ':uid' => $uid]);
$row = $stmt->fetch();
if ($row === false) json_error('신청을 찾을 수 없어요.', 404);
if ($row['status'] !== 'pending') json_error('이미 처리된 신청이에요.', 409);

db()->prepare(
    "UPDATE friendships SET status = 'accepted', decided_at = NOW() WHERE id = :id"
)->execute([':id' => $rid]);

// 원래 신청자에게 “수락됐어요” 알림
$me = load_user_by_id($uid);
notify(
    (int)$row['requester_id'],
    'friend_accepted',
    '친구 신청이 수락됐어요',
    "{$me['display_name']} 님이 친구 신청을 수락했어요.",
    '/friend.html?id=' . $uid
);

json_ok(['ok' => true]);
