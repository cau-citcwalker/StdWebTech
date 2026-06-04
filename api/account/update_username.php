<?php
/**
 * POST /api/account/update_username.php
 *   body: { current_password, new_username }
 *   응답: { data: { user } }   세션 토큰 재발급 + 재로그인 상태 유지
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$cur  = (string)($body['current_password'] ?? '');
$next = trim((string)($body['new_username'] ?? ''));

if ($cur === '' || $next === '') {
    json_error('현재 비밀번호와 새 아이디를 모두 입력해 주세요.', 422);
}
if (!preg_match(FINEDU_USERNAME_RE, $next)) {
    json_error('아이디는 3~40자 영문/숫자/밑줄(_)만 가능해요.', 422);
}

$user = load_user_by_id($uid);
if ($user === null) {
    json_error('계정을 찾을 수 없어요.', 404);
}
if (!password_verify($cur, $user['password_hash'])) {
    json_error('현재 비밀번호가 맞지 않아요.', 401);
}
if ($user['username'] === $next) {
    json_error('이미 사용 중인 아이디예요.', 422);
}

try {
    db()->prepare('UPDATE users SET username = :u WHERE id = :id')
        ->execute([':u' => $next, ':id' => $uid]);
} catch (PDOException $e) {
    if ((int)$e->errorInfo[1] === 1062) {
        json_error('이미 사용 중인 아이디예요.', 409);
    }
    throw $e;
}

$user = load_user_by_id($uid);
json_ok(['user' => public_user($user)]);
