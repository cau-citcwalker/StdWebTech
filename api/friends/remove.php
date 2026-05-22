<?php
/**
 * POST /api/friends/remove.php
 *   body: { friend_id: int }
 *
 *   양방향 친구 관계 해제. 어떤 방향이든 본인이 한쪽이면 OK.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$fid = (int)($body['friend_id'] ?? 0);
if ($fid <= 0) json_error('friend_id 가 필요해요.', 422);

db()->prepare(
    "DELETE FROM friendships
     WHERE status = 'accepted'
       AND ((requester_id = :u AND addressee_id = :f)
         OR (requester_id = :f AND addressee_id = :u))"
)->execute([':u' => $uid, ':f' => $fid]);

json_ok(['ok' => true]);
