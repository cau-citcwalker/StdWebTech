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
    $token = bin2hex(random_bytes(16));

    // session_token 컬럼이 마이그레이션 됐으면 같이 INSERT, 안 됐으면 빼고 INSERT 후
    // 다음 install.php 시 backfill 되도록 둔다.
    try {
        $stmt = db()->prepare(
            'INSERT INTO users (username, email, password_hash, display_name, session_token)
             VALUES (:u, :e, :h, :d, :t)'
        );
        $stmt->execute([
            ':u' => $username, ':e' => $email, ':h' => $hash, ':d' => $displayName, ':t' => $token,
        ]);
    } catch (PDOException $e) {
        // UNIQUE 충돌(1062)은 그대로 위로 던져 회원가입 핸들러에서 처리.
        if ((int)($e->errorInfo[1] ?? 0) === 1062) throw $e;
        // 그 외(예: session_token 컬럼 없음)면 컬럼 빼고 재시도.
        $stmt = db()->prepare(
            'INSERT INTO users (username, email, password_hash, display_name)
             VALUES (:u, :e, :h, :d)'
        );
        $stmt->execute([
            ':u' => $username, ':e' => $email, ':h' => $hash, ':d' => $displayName,
        ]);
    }

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
    // 계정 고유 토큰을 세션에 박아둔다. 매 요청마다 DB 값과 일치하는지 검증하므로
    // DB 재설치로 같은 user_id 가 재발급돼도 옛 세션은 자동 무효화됨.
    // (옛 DB 라 session_token 컬럼이 없으면 키 자체를 안 박음 — current_user_id 가
    //  user_id 만으로 fallback 검증함.)
    if (array_key_exists('session_token', $user) && $user['session_token'] !== null) {
        $_SESSION['session_token'] = (string)$user['session_token'];
    }

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
        'coins' => (int)($row['coins'] ?? 0),
        'streak_days' => (int)$row['streak_days'],
        'created_at' => $row['created_at'],
        'last_active_at' => $row['last_active_at'],
    ];
}
