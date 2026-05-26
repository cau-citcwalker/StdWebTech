<?php
/**
 * FinEdu — 원샷 DB 설치 스크립트
 *
 *   브라우저로 https://<도메인>/api/install.php 한 번 접속하면
 *   schema.sql → seed.sql → seed_avatar.sql 순서로 실행한다.
 *
 *   안전 장치:
 *     - users 테이블에 이미 데이터가 있으면 거부 (덮어쓰기 방지)
 *     - 재설치 강제: ?force=1&confirm=RESET 쿼리스트링 (모든 테이블 DROP 후 재생성)
 *
 *   설치 완료 후 이 파일은 반드시 서버에서 삭제할 것.
 */

declare(strict_types=1);

// 설정 로드
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo '<h1>config.php 가 없습니다.</h1>';
    echo '<p>먼저 <code>api/config.example.php</code> 를 참고해 <code>api/config.php</code> 를 만들어 서버에 올려 주세요.</p>';
    exit;
}
$cfg = require $configPath;

// HTML 출력 헬퍼
function step(string $label, bool $ok, string $detail = ''): void {
    $icon = $ok ? '✅' : '❌';
    $color = $ok ? '#1f7a00' : '#a01f1f';
    echo "<div style='padding:8px 12px;border-left:4px solid $color;background:#fff;margin:6px 0;'>";
    echo "<strong>$icon $label</strong>";
    if ($detail !== '') echo "<div style='color:#555;font-size:13px;margin-top:4px;'>$detail</div>";
    echo "</div>";
}

// 페이지 head
echo "<!DOCTYPE html><html lang='ko'><head><meta charset='utf-8'>";
echo "<title>FinEdu — DB 설치</title>";
echo "<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#222;background:#f7f7f7}h1{color:#1f2d99}code{background:#eee;padding:2px 6px;border-radius:4px;font-size:13px}.banner{padding:14px 18px;border-radius:12px;margin-bottom:20px}.banner--ok{background:#e3ffd0;border:2px solid #58cc02;color:#1f7a00}.banner--bad{background:#ffe3e3;border:2px solid #ff4b4b;color:#7a1a1a}</style>";
echo "</head><body><h1>FinEdu — DB 설치</h1>";

// DB 연결
try {
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s',
        $cfg['db']['host'], $cfg['db']['name'], $cfg['db']['charset']);
    $pdo = new PDO($dsn, $cfg['db']['user'], $cfg['db']['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    step('DB 연결', true, "host: {$cfg['db']['host']} / db: {$cfg['db']['name']}");
} catch (Throwable $e) {
    step('DB 연결', false, htmlspecialchars($e->getMessage()));
    exit;
}

$force = (($_GET['force'] ?? '') === '1' && ($_GET['confirm'] ?? '') === 'RESET');

// 안전 가드: 이미 설치되어 있는지 확인
try {
    $count = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ($count > 0 && !$force) {
        echo "<div class='banner banner--bad'>";
        echo "<strong>⚠️ 이미 설치돼 있어요</strong><br>";
        echo "users 테이블에 <strong>$count 명</strong>이 등록돼 있어 자동 거부했어요.<br><br>";
        echo "정말 모두 지우고 재설치하려면:<br>";
        echo "<code>install.php?force=1&confirm=RESET</code>";
        echo "</div>";
        echo "<p>설치가 끝나신 거라면 보안을 위해 <code>api/install.php</code> 파일을 서버에서 삭제해 주세요.</p>";
        echo "</body></html>";
        exit;
    }
} catch (PDOException $e) {
    // users 테이블이 아직 없으면 정상 — 그대로 진행
}

// force 모드: 기존 테이블 모두 DROP
if ($force) {
    $tables = ['notifications','user_equipment','user_items','items',
               'user_lesson_progress','questions','lessons','units',
               'friendships','coin_ledger','users'];
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    foreach ($tables as $t) {
        try { $pdo->exec("DROP TABLE IF EXISTS $t"); } catch (Throwable $e) {}
    }
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    step('기존 테이블 DROP', true, '강제 재설치 모드');
}

// SQL 파일 실행 헬퍼 — phpMyAdmin Import 와 동일하게 ;로 문장 분리해서 실행
function run_sql_file(PDO $pdo, string $path): array {
    if (!file_exists($path)) {
        return ['ok' => false, 'detail' => "파일 없음: $path"];
    }
    $sql = file_get_contents($path);
    if ($sql === false) {
        return ['ok' => false, 'detail' => "읽기 실패: $path"];
    }
    // DELIMITER 등 phpMyAdmin 전용 명령은 제거, 주석 라인은 그대로 PDO 가 무시
    // 단순 분할이라 문자열 안의 ;는 처리 못 함 — seed 들은 안전
    $statements = array_filter(
        array_map('trim', explode(";\n", $sql)),
        fn($s) => $s !== '' && !preg_match('/^\s*(--|\/\*)/m', substr($s, 0, 4))
    );
    $count = 0;
    try {
        foreach ($statements as $stmt) {
            if (trim($stmt) === '') continue;
            $pdo->exec($stmt);
            $count++;
        }
    } catch (Throwable $e) {
        return ['ok' => false, 'detail' => htmlspecialchars($e->getMessage()) . " (실행한 문장 수: $count)"];
    }
    return ['ok' => true, 'detail' => "$count 개 SQL 문장 실행 완료"];
}

// 1) schema.sql
$res = run_sql_file($pdo, __DIR__ . '/_init/schema.sql');
step('schema.sql — 테이블 생성', $res['ok'], $res['detail']);
if (!$res['ok']) { echo '</body></html>'; exit; }

// 2) seed.sql
$res = run_sql_file($pdo, __DIR__ . '/_init/seed.sql');
step('seed.sql — 학습 콘텐츠 시드', $res['ok'], $res['detail']);

// 3) seed_avatar.sql
$res = run_sql_file($pdo, __DIR__ . '/_init/seed_avatar.sql');
step('seed_avatar.sql — 아바타 아이템 시드', $res['ok'], $res['detail']);

// 결과 요약
echo "<div class='banner banner--ok'>";
echo "<strong>🎉 설치 완료</strong><br><br>";
$counts = [
    'users'    => '사용자',
    'units'    => '단원',
    'lessons'  => '레슨',
    'questions'=> '문제',
    'items'    => '아이템',
];
echo "<ul style='margin:0;padding-left:20px;'>";
foreach ($counts as $table => $label) {
    try {
        $n = (int)$pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
        echo "<li><strong>$label</strong>: $n 개</li>";
    } catch (Throwable $e) {}
}
echo "</ul>";
echo "</div>";

echo "<h2>다음 할 일</h2>";
echo "<ol>";
echo "<li>보안을 위해 <code>api/install.php</code> 파일을 서버에서 <strong>지금 바로 삭제</strong>해 주세요.</li>";
echo "<li><a href='/api/ping.php'>/api/ping.php</a> 로 백엔드 핑 확인.</li>";
echo "<li><a href='/'>홈으로</a> 가서 회원가입부터 둘러보기!</li>";
echo "</ol>";

echo "</body></html>";
