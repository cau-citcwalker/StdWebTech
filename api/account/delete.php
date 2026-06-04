<?php
/**
 * POST /api/account/delete.php
 *   body: { current_password, confirm: "DELETE" }
 *   응답: { data: { ok: true } }
 *
 *   계정 DELETE → ON DELETE CASCADE 로 user_items / user_equipment /
 *   user_lesson_progress / coin_ledger / friendships / notifications 등 함께 삭제.
 *   session 즉시 무효화.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$cur     = (string)($body['current_password'] ?? '');
$confirm = (string)($body['confirm'] ?? '');

if ($cur === '') {
    json_error('현재 비밀번호를 입력해 주세요.', 422);
}
if ($confirm !== 'DELETE') {
    json_error('탈퇴를 위해 확인 문구 DELETE 를 정확히 입력해 주세요.', 422);
}

$user = load_user_by_id($uid);
if ($user === null) {
    json_error('계정을 찾을 수 없어요.', 404);
}
if (!password_verify($cur, $user['password_hash'])) {
    json_error('현재 비밀번호가 맞지 않아요.', 401);
}

// 실제 DELETE — CASCADE 가 관련 행 정리
db()->prepare('DELETE FROM users WHERE id = :id')
    ->execute([':id' => $uid]);

destroy_session();
json_ok(['ok' => true]);
