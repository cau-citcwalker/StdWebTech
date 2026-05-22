<?php
/**
 * POST /api/auth/login.php
 *   body: { identifier, password }   identifier = username 또는 email
 *   response: { data: { user } }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');

$body = read_json_body();
$identifier = trim((string)($body['identifier'] ?? ''));
$password   = (string)($body['password'] ?? '');

if ($identifier === '' || $password === '') {
    json_error('아이디(또는 이메일)와 비밀번호를 모두 입력해 주세요.', 422);
}

$user = verify_credentials($identifier, $password);
if ($user === null) {
    json_error('아이디 또는 비밀번호가 맞지 않아요.', 401);
}

login_user($user);
json_ok(['user' => public_user($user)]);
