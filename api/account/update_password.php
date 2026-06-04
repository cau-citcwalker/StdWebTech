<?php
/**
 * POST /api/account/update_password.php
 *   body: { current_password, new_password }
 *   응답: { data: { ok: true } }   비밀번호 변경 후 session_token 재발급 →
 *         다른 디바이스 세션 자동 무효화.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$cur  = (string)($body['current_password'] ?? '');
$next = (string)($body['new_password'] ?? '');

if ($cur === '' || $next === '') {
    json_error('현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.', 422);
}
if (strlen($next) < 8) {
    json_error('새 비밀번호는 8자 이상이어야 해요.', 422);
}
if ($cur === $next) {
    json_error('현재 비밀번호와 다른 비밀번호를 입력해 주세요.', 422);
}

$user = load_user_by_id($uid);
if ($user === null) {
    json_error('계정을 찾을 수 없어요.', 404);
}
if (!password_verify($cur, $user['password_hash'])) {
    json_error('현재 비밀번호가 맞지 않아요.', 401);
}

$pw = $GLOBALS['FINEDU_CONFIG']['password'];
$hash = password_hash($next, $pw['algo'], ['cost' => $pw['cost']]);
$token = bin2hex(random_bytes(16));

db()->prepare(
    'UPDATE users SET password_hash = :h, session_token = :t WHERE id = :id'
)->execute([':h' => $hash, ':t' => $token, ':id' => $uid]);

// 내 현재 세션도 새 토큰으로 갈아끼움 — 즉시 로그아웃 안 되게.
$_SESSION['session_token'] = $token;

json_ok(['ok' => true]);
