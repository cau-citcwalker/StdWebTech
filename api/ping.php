<?php
/**
 * 서버 / DB 연결 확인용 헬스 체크.
 *   GET /api/ping.php
 */

require __DIR__ . '/_lib/bootstrap.php';

try {
    $row = db()->query('SELECT 1 AS ok')->fetch();
    json_ok([
        'service' => 'finedu-api',
        'db'      => (int)$row['ok'] === 1 ? 'up' : 'unknown',
        'time'    => date('c'),
    ]);
} catch (Throwable $e) {
    json_error('DB 핑 실패: ' . $e->getMessage(), 500);
}
