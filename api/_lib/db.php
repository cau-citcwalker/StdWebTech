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
            // 같은 named param 을 한 쿼리에서 여러 번 쓸 수 있도록 (예: WHERE a=:u OR b=:u)
            // PDO 가 client-side 에서 처리. 보안적 차이는 거의 없음.
            PDO::ATTR_EMULATE_PREPARES   => true,
        ]);
    } catch (Throwable $e) {
        if (!empty($GLOBALS['FINEDU_CONFIG']['debug'])) {
            json_error('DB 연결 실패: ' . $e->getMessage(), 500);
        }
        json_error('데이터베이스에 연결할 수 없습니다.', 500);
    }
    return $pdo;
}
