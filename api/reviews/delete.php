<?php
/**
 * POST /api/reviews/delete.php
 *   body: { id }
 *   응답: { data: { ok: true } }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$id = (int)($body['id'] ?? 0);
if ($id <= 0) json_error('id 가 필요해요.', 422);

$row = db()->prepare('SELECT user_id FROM site_reviews WHERE id = :id LIMIT 1');
$row->execute([':id' => $id]);
$ownerId = $row->fetchColumn();
if ($ownerId === false)    json_error('리뷰를 찾을 수 없어요.', 404);
if ((int)$ownerId !== $uid) json_error('내 리뷰만 삭제할 수 있어요.', 403);

db()->prepare('DELETE FROM site_reviews WHERE id = :id')->execute([':id' => $id]);
json_ok(['ok' => true]);
