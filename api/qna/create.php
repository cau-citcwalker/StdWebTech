<?php
/**
 * POST /api/qna/create.php
 *   body: { category, title, body }
 *   응답: { data: { id } }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$category = (string)($body['category'] ?? 'general');
$title    = trim((string)($body['title'] ?? ''));
$text     = trim((string)($body['body']  ?? ''));

$validCats = ['general','stock','market','basics','macro','asset','tax'];
if (!in_array($category, $validCats, true)) $category = 'general';
if (mb_strlen($title) < 2 || mb_strlen($title) > 200) json_error('제목은 2~200자.', 422);
if (mb_strlen($text)  < 2 || mb_strlen($text)  > 10000) json_error('내용은 2~10000자.', 422);

$stmt = db()->prepare(
    'INSERT INTO qna_posts (user_id, category, title, body) VALUES (:u, :c, :t, :b)'
);
$stmt->execute([':u' => $uid, ':c' => $category, ':t' => $title, ':b' => $text]);
json_ok(['id' => (int)db()->lastInsertId()]);
