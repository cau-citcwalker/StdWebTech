<?php
/**
 * POST /api/reviews/update.php
 *   body: { id, rating, body }
 *   응답: { data: { ok: true } }
 *
 *   오너만 수정 가능. 본인 리뷰가 아니면 403.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body   = read_json_body();
$id     = (int)($body['id'] ?? 0);
$rating = (int)($body['rating'] ?? 0);
$text   = trim((string)($body['body'] ?? ''));

if ($id <= 0)                json_error('id 가 필요해요.', 422);
if ($rating < 1 || $rating > 5)  json_error('평점은 1~5 사이여야 해요.', 422);
if (mb_strlen($text) < 2)        json_error('내용을 2자 이상 입력해 주세요.', 422);
if (mb_strlen($text) > 2000)     json_error('내용이 너무 길어요 (최대 2000자).', 422);

$row = db()->prepare('SELECT user_id FROM site_reviews WHERE id = :id LIMIT 1');
$row->execute([':id' => $id]);
$ownerId = $row->fetchColumn();
if ($ownerId === false)    json_error('리뷰를 찾을 수 없어요.', 404);
if ((int)$ownerId !== $uid) json_error('내 리뷰만 수정할 수 있어요.', 403);

db()->prepare(
    'UPDATE site_reviews SET rating = :r, body = :b, updated_at = NOW() WHERE id = :id'
)->execute([':r' => $rating, ':b' => $text, ':id' => $id]);

json_ok(['ok' => true]);
