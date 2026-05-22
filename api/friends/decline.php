<?php
/**
 * POST /api/friends/decline.php
 *   body: { request_id: int }
 *
 *   pending 신청을 거절(declined) 로 표시. 본인이 addressee 일 때만.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$rid = (int)($body['request_id'] ?? 0);
if ($rid <= 0) json_error('request_id 가 필요해요.', 422);

$stmt = db()->prepare(
    "SELECT id FROM friendships
     WHERE id = :id AND addressee_id = :uid AND status = 'pending' LIMIT 1"
);
$stmt->execute([':id' => $rid, ':uid' => $uid]);
$row = $stmt->fetch();
if ($row === false) json_error('신청을 찾을 수 없어요.', 404);

db()->prepare(
    "UPDATE friendships SET status = 'declined', decided_at = NOW() WHERE id = :id"
)->execute([':id' => $rid]);

json_ok(['ok' => true]);
