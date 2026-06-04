<?php
/**
 * POST /api/scraps/toggle.php
 *   body: { target_type, target_key }
 *     target_type: 'lesson' | 'term'
 *     target_key:  lesson id (정수 문자열) 또는 term slug
 *   응답: { data: { scraped: bool, total: int } }
 *
 *   이미 저장돼있으면 해제, 아니면 저장 (toggle).
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$type = (string)($body['target_type'] ?? '');
$key  = (string)($body['target_key']  ?? '');

if (!in_array($type, ['lesson', 'term'], true)) {
    json_error('알 수 없는 즐겨찾기 종류예요.', 422);
}
if ($key === '' || mb_strlen($key) > 120) {
    json_error('target_key 가 비어있거나 너무 길어요.', 422);
}

// lesson 의 경우 실제 존재하는 ID 인지 가볍게 검증 (term 은 클라이언트 JSON 이라 SKIP)
if ($type === 'lesson') {
    $lid = (int)$key;
    if ($lid <= 0) json_error('lesson id 가 올바르지 않아요.', 422);
    $exists = db()->prepare('SELECT 1 FROM lessons WHERE id = :id LIMIT 1');
    $exists->execute([':id' => $lid]);
    if ($exists->fetchColumn() === false) json_error('레슨을 찾을 수 없어요.', 404);
}

// 이미 저장돼있는지?
$has = db()->prepare(
    'SELECT id FROM user_scraps WHERE user_id = :u AND target_type = :t AND target_key = :k LIMIT 1'
);
$has->execute([':u' => $uid, ':t' => $type, ':k' => $key]);
$row = $has->fetchColumn();

if ($row !== false) {
    db()->prepare('DELETE FROM user_scraps WHERE id = :id')->execute([':id' => $row]);
    $scraped = false;
} else {
    db()->prepare(
        'INSERT INTO user_scraps (user_id, target_type, target_key) VALUES (:u, :t, :k)'
    )->execute([':u' => $uid, ':t' => $type, ':k' => $key]);
    $scraped = true;
}

$cnt = db()->prepare('SELECT COUNT(*) FROM user_scraps WHERE user_id = :u');
$cnt->execute([':u' => $uid]);
$total = (int)$cnt->fetchColumn();

json_ok(['scraped' => $scraped, 'total' => $total]);
