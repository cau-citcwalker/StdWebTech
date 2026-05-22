<?php
/**
 * FinEdu — DB 연결 (싱글톤 PDO)
 */

declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $cfg = $GLOBALS['FINEDU_CONFIG']['db'];
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $cfg['host'],
        $cfg['name'],
        $cfg['charset']
    );

    try {
        $pdo = new PDO($dsn, $cfg['user'], $cfg['password'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (Throwable $e) {
        if (!empty($GLOBALS['FINEDU_CONFIG']['debug'])) {
            json_error('DB 연결 실패: ' . $e->getMessage(), 500);
        }
        json_error('데이터베이스에 연결할 수 없습니다.', 500);
    }
    return $pdo;
}
