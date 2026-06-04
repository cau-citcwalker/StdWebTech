<?php
/**
 * POST /api/qna/reply_update.php
 *   body: { id, body }
 *   응답: { data: { ok: true } }   (오너만)
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$id   = (int)($body['id'] ?? 0);
$text = trim((string)($body['body'] ?? ''));

if ($id <= 0) json_error('id 가 필요해요.', 422);
if (mb_strlen($text) < 2 || mb_strlen($text) > 5000) json_error('답글은 2~5000자.', 422);

$row = db()->prepare('SELECT user_id FROM qna_replies WHERE id = :id LIMIT 1');
$row->execute([':id' => $id]);
$ownerId = $row->fetchColumn();
if ($ownerId === false)     json_error('답글을 찾을 수 없어요.', 404);
if ((int)$ownerId !== $uid) json_error('내 답글만 수정할 수 있어요.', 403);

db()->prepare(
    'UPDATE qna_replies SET body = :b, updated_at = NOW() WHERE id = :id'
)->execute([':b' => $text, ':id' => $id]);

json_ok(['ok' => true]);
