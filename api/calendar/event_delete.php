<?php
/**
 * POST /api/calendar/event_delete.php
 *   body: { id }
 *   응답: { data: { ok: true } }   (오너만)
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$id = (int)($body['id'] ?? 0);
if ($id <= 0) json_error('id 가 필요해요.', 422);

$row = db()->prepare('SELECT user_id FROM study_events WHERE id = :id LIMIT 1');
$row->execute([':id' => $id]);
$ownerId = $row->fetchColumn();
if ($ownerId === false)     json_error('이벤트를 찾을 수 없어요.', 404);
if ((int)$ownerId !== $uid) json_error('내 이벤트만 삭제할 수 있어요.', 403);

db()->prepare('DELETE FROM study_events WHERE id = :id')->execute([':id' => $id]);
json_ok(['ok' => true]);
