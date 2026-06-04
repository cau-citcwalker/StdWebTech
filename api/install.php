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

// SQL 파일 실행 헬퍼
//   1) 줄/블록 주석 제거 → 2) 줄바꿈 정규화 → 3) `;` 로 분할 → 4) 하나씩 exec
//   schema/seed 들은 SQL 문자열 안에 `;` 가 없으므로 단순 분할로 충분.
function run_sql_file(PDO $pdo, string $path): array {
    if (!file_exists($path)) {
        return ['ok' => false, 'detail' => "파일 없음: $path"];
    }
    $sql = file_get_contents($path);
    if ($sql === false) {
        return ['ok' => false, 'detail' => "읽기 실패: $path"];
    }

    // CRLF → LF 정규화
    $sql = str_replace("\r\n", "\n", $sql);
    // 줄 주석 제거 (--... EOL)
    $sql = preg_replace('/--[^\n]*/m', '', $sql);
    // 블록 주석 제거 (/* ... */)
    $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);

    // `;` 로 분할, 공백/빈 문장 제거
    $parts = explode(';', $sql);
    $statements = [];
    foreach ($parts as $p) {
        $t = trim($p);
        if ($t !== '') $statements[] = $t;
    }

    $count = 0;
    try {
        foreach ($statements as $stmt) {
            $pdo->exec($stmt);
            $count++;
        }
    } catch (Throwable $e) {
        return ['ok' => false, 'detail' => htmlspecialchars($e->getMessage()) . " (실행한 문장 수: $count / 전체 " . count($statements) . ")"];
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

// 2.5) 마이그레이션 — 옛 items.svg_markup 컬럼이 남아있으면 제거
//      (SVG fragment 가 /assets/img/items/{slot}/{slug}.svg 로 옮겨감.
//       force 모드면 테이블 자체가 이미 drop 됐으니 try 가 실패해도 무해.)
try {
    $pdo->exec('ALTER TABLE items DROP COLUMN svg_markup');
    step('마이그레이션 — items.svg_markup 컬럼 제거', true, '옛 컬럼 정리 완료');
} catch (Throwable $e) {
    // 이미 없는 경우가 정상 (force 재설치 또는 신규 설치)
}

// 2.55) 마이그레이션 — 슬롯 시스템: hair / top / bottom 으로 분리.
//       이전엔 outfit 단일 풀바디 슬롯이었으나, 상의·하의 따로 갈아입기를 위해 분해됨.
//       옛 outfit 아이템들과 outfit 슬롯의 user_equipment 행 정리.
//       또 그 이전(예: face/shoes/accessory) 죽은 슬롯도 함께 청소 (idempotent).
//       (force 모드면 items 테이블이 drop 된 상태라 try 가 NOP 으로 끝남.)
try {
    // 현재 살아있는 슬러그 화이트리스트 — 그 외엔 옛 잔재로 보고 제거.
    // combo-lookup 구조로 단순화: hair/top/bottom 각 3개씩.
    $liveHair   = "'hair-1','hair-2','hair-3'";
    $liveTop    = "'top-1','top-2','top-3'";
    $liveBottom = "'bottom-1','bottom-2','bottom-3'";

    $deadSlots = "'outfit','face','shoes','accessory'";
    $oldIds = $pdo->query(
        "SELECT id FROM items
         WHERE slot IN ($deadSlots)
            OR (slot = 'hair'   AND slug NOT IN ($liveHair))
            OR (slot = 'top'    AND slug NOT IN ($liveTop))
            OR (slot = 'bottom' AND slug NOT IN ($liveBottom))"
    )->fetchAll(PDO::FETCH_COLUMN);
    if ($oldIds) {
        $in = implode(',', array_map('intval', $oldIds));
        $pdo->exec("DELETE FROM user_equipment WHERE item_id IN ($in)");
        $pdo->exec("DELETE FROM user_items WHERE item_id IN ($in)");
        $pdo->exec("DELETE FROM items WHERE id IN ($in)");
    }
    // 죽은 슬롯에 매여 있던 잔여 장착 행도 확실히 제거
    $pdo->exec("DELETE FROM user_equipment WHERE slot IN ($deadSlots)");
    if ($oldIds) {
        step('마이그레이션 — 옛 슬롯 정리', true, count($oldIds) . '개 아이템 + 관계 행 삭제');
    }
} catch (Throwable $e) {
    // 테이블이 없거나 이미 정리된 경우 — 무시
}

// 2.6) 마이그레이션 — users.session_token 컬럼 추가 + 기존 행 백필
//      phantom-session 방지용. 세션 쿠키가 들고 다니는 user_id 가 DB 의 동일 계정을
//      가리키는지 token 으로 한 번 더 검증해서, 같은 ID 가 재발급된 경우 옛 세션을 끊는다.
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN session_token VARCHAR(64) NOT NULL DEFAULT ''");
    // 새로 만든 컬럼이라 기존 행은 전부 빈 값. 행별 무작위 hex 로 채워준다.
    $rows = $pdo->query("SELECT id FROM users WHERE session_token = ''")->fetchAll(PDO::FETCH_COLUMN);
    if ($rows) {
        $upd = $pdo->prepare('UPDATE users SET session_token = :t WHERE id = :id');
        foreach ($rows as $id) {
            $upd->execute([':t' => bin2hex(random_bytes(16)), ':id' => (int)$id]);
        }
    }
    step('마이그레이션 — users.session_token 추가 + 백필', true, count($rows) . '개 행 토큰 발급');
} catch (Throwable $e) {
    // 이미 있는 경우가 정상 (force 재설치 또는 두 번째 실행)
}

// 2.7) 마이그레이션 — 즐겨찾기 (scrap / bookmark) 테이블
//      학습 레슨 / 용어사전 항목을 사용자가 저장.
//      target_type: 'lesson' | 'term'
//      target_key:  lesson id (정수 문자열) 또는 term slug (소문자 한글/영문)
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_scraps (
            id           INT UNSIGNED       NOT NULL AUTO_INCREMENT,
            user_id      INT UNSIGNED       NOT NULL,
            target_type  VARCHAR(20)        NOT NULL,
            target_key   VARCHAR(120)       NOT NULL,
            scraped_at   DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uniq_user_scrap (user_id, target_type, target_key),
            KEY idx_scraps_user (user_id),
            CONSTRAINT fk_scraps_user FOREIGN KEY (user_id)
                REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    step('마이그레이션 — user_scraps 테이블', true, '즐겨찾기 시스템 준비 완료');
} catch (Throwable $e) {
    // 이미 있으면 무해
}

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
