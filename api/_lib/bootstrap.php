<?php
/**
 * FinEdu — 백엔드 부트스트랩
 *
 * 모든 PHP 엔드포인트의 첫 줄에서 require 한다.
 *   - 설정 로드
 *   - 에러 표시 모드
 *   - 세션 시작 (LAX 쿠키)
 *   - 기본 헤더(JSON, CORS-내부)
 *   - 공용 응답 / DB 헬퍼 로드
 */

declare(strict_types=1);

if (!defined('FINEDU_APP_ROOT')) {
    define('FINEDU_APP_ROOT', dirname(__DIR__, 2));
}
if (!defined('FINEDU_API_ROOT')) {
    define('FINEDU_API_ROOT', dirname(__DIR__));
}

$configPath = FINEDU_API_ROOT . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => '서버 설정 파일을 찾을 수 없습니다. config.example.php 를 config.php 로 복사하세요.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$GLOBALS['FINEDU_CONFIG'] = require $configPath;

if (!empty($GLOBALS['FINEDU_CONFIG']['debug'])) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
    ini_set('display_errors', '0');
}

$sessionCfg = $GLOBALS['FINEDU_CONFIG']['session'];
if (session_status() === PHP_SESSION_NONE) {
    session_name($sessionCfg['name']);
    session_set_cookie_params([
        'lifetime' => $sessionCfg['lifetime'],
        'path'     => '/',
        'secure'   => (bool)$sessionCfg['secure'],
        'httponly' => true,
        'samesite' => $sessionCfg['samesite'],
    ]);
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require __DIR__ . '/response.php';
require __DIR__ . '/db.php';
