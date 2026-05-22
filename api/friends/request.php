<?php
/**
 * POST /api/friends/request.php
 *   body: { identifier: string }   // username 또는 email
 *
 *   - 본인 신청 금지
 *   - 이미 친구 / 이미 신청 / 거절된 신청 케이스별로 응답
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/friends.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$identifier = trim((string)($body['identifier'] ?? ''));
if ($identifier === '') json_error('아이디 또는 이메일을 입력해 주세요.', 422);

$target = load_user_by_identifier($identifier);
if ($target === null) json_error('해당 사용자를 찾을 수 없어요.', 404);
$targetId = (int)$target['id'];

if ($targetId === $uid) json_error('자기 자신에게는 친구 신청을 보낼 수 없어요.', 400);

if (are_friends($uid, $targetId)) {
    json_error('이미 친구예요.', 409);
}

// 이미 (uid → target) pending 이 있으면 중복
$existSelf = pending_between($uid, $targetId);
if ($existSelf && $existSelf['status'] === 'pending') {
    json_error('이미 신청을 보냈어요.', 409);
}
if ($existSelf && $existSelf['status'] === 'declined') {
    // 거절된 적이 있어도 다시 보낼 수 있게 — 같은 행 갱신
    db()->prepare(
        "UPDATE friendships
            SET status = 'pending', created_at = NOW(), decided_at = NULL
          WHERE id = :id"
    )->execute([':id' => $existSelf['id']]);
    json_ok(['request_id' => (int)$existSelf['id']]);
}

// 반대 방향에서 들어온 pending 이 이미 있으면 — 그 신청을 “수락”으로 바꾸자 (편의)
$existIn = pending_between($targetId, $uid);
if ($existIn && $existIn['status'] === 'pending') {
    db()->prepare(
        "UPDATE friendships SET status = 'accepted', decided_at = NOW() WHERE id = :id"
    )->execute([':id' => $existIn['id']]);
    json_ok(['accepted' => true, 'request_id' => (int)$existIn['id']]);
}

$ins = db()->prepare(
    'INSERT INTO friendships (requester_id, addressee_id) VALUES (:r, :a)'
);
$ins->execute([':r' => $uid, ':a' => $targetId]);
json_ok(['request_id' => (int)db()->lastInsertId()]);
