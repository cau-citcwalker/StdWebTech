<?php
/**
 * POST /api/qna/update.php
 *   body: { id, category, title, body }
 *   응답: { data: { ok: true } }    (오너만)
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body     = read_json_body();
$id       = (int)($body['id'] ?? 0);
$category = (string)($body['category'] ?? 'general');
$title    = trim((string)($body['title'] ?? ''));
$text     = trim((string)($body['body']  ?? ''));

if ($id <= 0) json_error('id 가 필요해요.', 422);
$validCats = ['general','stock','market','basics','macro','asset','tax'];
if (!in_array($category, $validCats, true)) $category = 'general';
if (mb_strlen($title) < 2 || mb_strlen($title) > 200) json_error('제목은 2~200자.', 422);
if (mb_strlen($text)  < 2 || mb_strlen($text)  > 10000) json_error('내용은 2~10000자.', 422);

$row = db()->prepare('SELECT user_id FROM qna_posts WHERE id = :id LIMIT 1');
$row->execute([':id' => $id]);
$ownerId = $row->fetchColumn();
if ($ownerId === false)     json_error('게시글을 찾을 수 없어요.', 404);
if ((int)$ownerId !== $uid) json_error('내 글만 수정할 수 있어요.', 403);

db()->prepare(
    'UPDATE qna_posts SET category = :c, title = :t, body = :b, updated_at = NOW() WHERE id = :id'
)->execute([':c' => $category, ':t' => $title, ':b' => $text, ':id' => $id]);

json_ok(['ok' => true]);
