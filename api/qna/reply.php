<?php
/**
 * POST /api/qna/reply.php
 *   body: { post_id, body }
 *   응답: { data: { id, reply_count } }
 *
 *   답글 추가 + qna_posts.reply_count 증분.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$pid  = (int)($body['post_id'] ?? 0);
$text = trim((string)($body['body'] ?? ''));

if ($pid <= 0) json_error('post_id 가 필요해요.', 422);
if (mb_strlen($text) < 2 || mb_strlen($text) > 5000) json_error('답글은 2~5000자.', 422);

// 게시글 존재 확인
$has = db()->prepare('SELECT 1 FROM qna_posts WHERE id = :id LIMIT 1');
$has->execute([':id' => $pid]);
if ($has->fetchColumn() === false) json_error('게시글을 찾을 수 없어요.', 404);

$ins = db()->prepare(
    'INSERT INTO qna_replies (post_id, user_id, body) VALUES (:p, :u, :b)'
);
$ins->execute([':p' => $pid, ':u' => $uid, ':b' => $text]);
$id = (int)db()->lastInsertId();

db()->prepare('UPDATE qna_posts SET reply_count = reply_count + 1 WHERE id = :id')
    ->execute([':id' => $pid]);

$cnt = db()->prepare('SELECT reply_count FROM qna_posts WHERE id = :id');
$cnt->execute([':id' => $pid]);
$replyCount = (int)$cnt->fetchColumn();

json_ok(['id' => $id, 'reply_count' => $replyCount]);
