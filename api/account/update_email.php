<?php
/**
 * POST /api/account/update_email.php
 *   body: { current_password, new_email }
 *   응답: { data: { user } }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$cur  = (string)($body['current_password'] ?? '');
$next = trim((string)($body['new_email'] ?? ''));

if ($cur === '' || $next === '') {
    json_error('현재 비밀번호와 새 이메일을 모두 입력해 주세요.', 422);
}
if (!filter_var($next, FILTER_VALIDATE_EMAIL)) {
    json_error('이메일 형식이 올바르지 않아요.', 422);
}

$user = load_user_by_id($uid);
if ($user === null) {
    json_error('계정을 찾을 수 없어요.', 404);
}
if (!password_verify($cur, $user['password_hash'])) {
    json_error('현재 비밀번호가 맞지 않아요.', 401);
}
if (strcasecmp($user['email'], $next) === 0) {
    json_error('이미 등록된 이메일과 같아요.', 422);
}

try {
    db()->prepare('UPDATE users SET email = :e WHERE id = :id')
        ->execute([':e' => $next, ':id' => $uid]);
} catch (PDOException $e) {
    if ((int)$e->errorInfo[1] === 1062) {
        json_error('이미 가입된 이메일이에요.', 409);
    }
    throw $e;
}

$user = load_user_by_id($uid);
json_ok(['user' => public_user($user)]);
