<?php
/**
 * FinEdu — JSON 응답 헬퍼
 */

declare(strict_types=1);

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_ok($data = null): void
{
    json_response(['data' => $data], 200);
}

function json_error(string $message, int $status = 400, array $extra = []): void
{
    json_response(array_merge(['error' => $message], $extra), $status);
}

function require_method(string ...$methods): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, $methods, true)) {
        json_error('허용되지 않은 HTTP 메서드입니다.', 405);
    }
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) return [];
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        json_error('요청 본문이 올바른 JSON 이 아닙니다.', 400);
    }
    return $decoded;
}

function current_user_id(): ?int
{
    static $verified = false;
    static $resolved = null;
    if ($verified) return $resolved;
    $verified = true;

    if (!isset($_SESSION['user_id'])) {
        return $resolved = null;
    }

    $uid   = (int)$_SESSION['user_id'];
    $token = $_SESSION['session_token'] ?? null;

    // 세션의 user_id 가 가리키는 계정이 아직 DB 에 있고, 그 계정의 session_token 이
    // 세션이 기억하는 토큰과 일치할 때만 인증 통과. 어긋나면 phantom-session
    // (DB 재설치 후 같은 user_id 재발급) 으로 보고 즉시 무효화한다.
    //
    // 단, session_token 컬럼이 아직 마이그레이션 안 된 환경이면 (install.php 재실행
    // 전) PDOException 이 발생한다. 그 경우엔 user_id 존재 확인만으로 fallback.
    try {
        $stmt = db()->prepare('SELECT session_token FROM users WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $uid]);
        $dbToken = $stmt->fetchColumn();
        if ($dbToken === false) {
            destroy_session();
            return $resolved = null;
        }
        if ($token !== null && !hash_equals((string)$dbToken, (string)$token)) {
            destroy_session();
            return $resolved = null;
        }
        return $resolved = $uid;
    } catch (Throwable $e) {
        // 컬럼이 없거나 DB 가 일시적으로 문제 — user_id 만으로 fallback.
        $stmt = db()->prepare('SELECT 1 FROM users WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $uid]);
        if ($stmt->fetchColumn() === false) {
            destroy_session();
            return $resolved = null;
        }
        return $resolved = $uid;
    }
}

function destroy_session(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(), '', time() - 42000,
            $params['path'], $params['domain'] ?? '',
            $params['secure'], $params['httponly']
        );
    }
    @session_destroy();
}

function require_login(): int
{
    $uid = current_user_id();
    if ($uid === null) {
        json_error('로그인이 필요합니다.', 401);
    }
    return $uid;
}
