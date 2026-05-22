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
    return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
}

function require_login(): int
{
    $uid = current_user_id();
    if ($uid === null) {
        json_error('로그인이 필요합니다.', 401);
    }
    return $uid;
}
