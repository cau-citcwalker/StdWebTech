<?php
/**
 * POST /api/auth/signup.php
 *   body: { username, email, password, display_name? }
 *   response: { data: { user } }  // 세션 시작됨
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');

$body = read_json_body();
[$errors, $clean] = validate_signup_input($body);
if ($errors) {
    json_error('입력값이 올바르지 않아요.', 422, ['fields' => $errors]);
}

try {
    $user = create_user(
        $clean['username'],
        $clean['email'],
        $clean['password'],
        $clean['display_name']
    );
} catch (PDOException $e) {
    if ((int)$e->errorInfo[1] === 1062) {
        $msg = stripos($e->getMessage(), 'uniq_users_email') !== false
             ? '이미 가입된 이메일이에요.'
             : '이미 사용 중인 아이디예요.';
        json_error($msg, 409);
    }
    throw $e;
}

login_user($user);
json_ok(['user' => public_user($user)]);
