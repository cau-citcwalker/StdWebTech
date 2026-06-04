<?php
/**
 * POST /api/calendar/event_update.php
 *   body: { id, event_date, title, note? }
 *   응답: { data: { ok: true } }   (오너만)
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body  = read_json_body();
$id    = (int)($body['id'] ?? 0);
$date  = (string)($body['event_date'] ?? '');
$title = trim((string)($body['title'] ?? ''));
$note  = trim((string)($body['note']  ?? ''));

if ($id <= 0) json_error('id 가 필요해요.', 422);
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) json_error('날짜 형식 YYYY-MM-DD.', 422);
if (mb_strlen($title) < 1 || mb_strlen($title) > 120) json_error('제목은 1~120자.', 422);
if (mb_strlen($note) > 500) json_error('메모는 500자 이내.', 422);

$row = db()->prepare('SELECT user_id FROM study_events WHERE id = :id LIMIT 1');
$row->execute([':id' => $id]);
$ownerId = $row->fetchColumn();
if ($ownerId === false)     json_error('이벤트를 찾을 수 없어요.', 404);
if ((int)$ownerId !== $uid) json_error('내 이벤트만 수정할 수 있어요.', 403);

db()->prepare(
    'UPDATE study_events SET event_date = :d, title = :t, note = :n, updated_at = NOW() WHERE id = :id'
)->execute([
    ':d' => $date, ':t' => $title, ':n' => ($note === '' ? null : $note), ':id' => $id,
]);
json_ok(['ok' => true]);
