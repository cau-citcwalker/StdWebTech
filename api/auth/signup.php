<?php
/**
 * POST /api/auth/signup.php
 *   body: { username, email, password, display_name? }
 *   response: { data: { user } }  // 세션 시작됨
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/notify.php';

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

// 환영 알림
notify(
    (int)$user['id'],
    'system',
    '환영해요, ' . $user['display_name'] . '!',
    '첫 레슨을 풀고 도토리를 자랑해보세요. 옷장에서 바로 꾸밀 수도 있어요.',
    '/learn.html'
);

json_ok(['user' => public_user($user)]);
