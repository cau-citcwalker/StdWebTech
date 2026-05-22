<?php
/**
 * FinEdu — 인증 헬퍼
 *
 *   create_user($username, $email, $password, $displayName)
 *   verify_credentials($identifier, $password)   // 식별자: username 또는 email
 *   login_user($userRow)
 *   logout_user()
 *   load_current_user(): ?array
 *   public_user($row): array     세션/외부 노출용으로 안전한 필드만 추리기
 */

declare(strict_types=1);

const FINEDU_USERNAME_RE = '/^[A-Za-z0-9_]{3,40}$/';

function validate_signup_input(array $body): array
{
    $username = trim((string)($body['username'] ?? ''));
    $email    = trim((string)($body['email'] ?? ''));
    $password = (string)($body['password'] ?? '');
    $display  = trim((string)($body['display_name'] ?? ''));
    if ($display === '') $display = $username;

    $errors = [];

    if (!preg_match(FINEDU_USERNAME_RE, $username)) {
        $errors['username'] = '아이디는 3~40자 영문/숫자/밑줄(_)만 가능해요.';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = '이메일 형식이 올바르지 않아요.';
    }
    if (strlen($password) < 8) {
        $errors['password'] = '비밀번호는 8자 이상이어야 해요.';
    }
    if (mb_strlen($display) < 1 || mb_strlen($display) > 60) {
        $errors['display_name'] = '닉네임은 1~60자 사이로 입력해 주세요.';
    }

    return [$errors, [
        'username' => $username,
        'email' => $email,
        'password' => $password,
        'display_name' => $display,
    ]];
}

function create_user(string $username, string $email, string $password, string $displayName): array
{
    $pw = $GLOBALS['FINEDU_CONFIG']['password'];
    $hash = password_hash($password, $pw['algo'], ['cost' => $pw['cost']]);

    $stmt = db()->prepare(
        'INSERT INTO users (username, email, password_hash, display_name)
         VALUES (:u, :e, :h, :d)'
    );
    $stmt->execute([
        ':u' => $username,
        ':e' => $email,
        ':h' => $hash,
        ':d' => $displayName,
    ]);

    $id = (int)db()->lastInsertId();
    return load_user_by_id($id);
}

function load_user_by_id(int $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    return $row === false ? null : $row;
}

function load_user_by_identifier(string $identifier): ?array
{
    $stmt = db()->prepare(
        'SELECT * FROM users
         WHERE username = :id OR email = :id
         LIMIT 1'
    );
    $stmt->execute([':id' => $identifier]);
    $row = $stmt->fetch();
    return $row === false ? null : $row;
}

function verify_credentials(string $identifier, string $password): ?array
{
    $user = load_user_by_identifier($identifier);
    if ($user === null) return null;
    if (!password_verify($password, $user['password_hash'])) return null;
    return $user;
}

function login_user(array $user): void
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int)$user['id'];

    db()->prepare('UPDATE users SET last_active_at = NOW() WHERE id = :id')
        ->execute([':id' => $user['id']]);
}

function logout_user(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();
}

function load_current_user(): ?array
{
    $uid = current_user_id();
    if ($uid === null) return null;
    return load_user_by_id($uid);
}

function public_user(array $row): array
{
    return [
        'id' => (int)$row['id'],
        'username' => $row['username'],
        'email' => $row['email'],
        'display_name' => $row['display_name'],
        'xp' => (int)$row['xp'],
        'streak_days' => (int)$row['streak_days'],
        'created_at' => $row['created_at'],
        'last_active_at' => $row['last_active_at'],
    ];
}
