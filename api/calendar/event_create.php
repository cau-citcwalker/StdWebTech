<?php
/**
 * POST /api/calendar/event_create.php
 *   body: { event_date 'YYYY-MM-DD', title, note? }
 *   응답: { data: { id } }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$date = (string)($body['event_date'] ?? '');
$title = trim((string)($body['title'] ?? ''));
$note  = trim((string)($body['note']  ?? ''));

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date))   json_error('날짜 형식 YYYY-MM-DD 이어야 해요.', 422);
if (mb_strlen($title) < 1 || mb_strlen($title) > 120) json_error('제목은 1~120자.', 422);
if (mb_strlen($note) > 500)                           json_error('메모는 500자 이내.', 422);

$stmt = db()->prepare(
    'INSERT INTO study_events (user_id, event_date, title, note) VALUES (:u, :d, :t, :n)'
);
$stmt->execute([':u' => $uid, ':d' => $date, ':t' => $title, ':n' => ($note === '' ? null : $note)]);
json_ok(['id' => (int)db()->lastInsertId()]);
