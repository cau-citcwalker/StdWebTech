<?php
/**
 * POST /api/qna/reply_delete.php
 *   body: { id }
 *   응답: { data: { ok: true, reply_count } }   (오너만)
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$id = (int)($body['id'] ?? 0);
if ($id <= 0) json_error('id 가 필요해요.', 422);

$row = db()->prepare('SELECT user_id, post_id FROM qna_replies WHERE id = :id LIMIT 1');
$row->execute([':id' => $id]);
$r = $row->fetch();
if ($r === false)     json_error('답글을 찾을 수 없어요.', 404);
if ((int)$r['user_id'] !== $uid) json_error('내 답글만 삭제할 수 있어요.', 403);

$pid = (int)$r['post_id'];

db()->prepare('DELETE FROM qna_replies WHERE id = :id')->execute([':id' => $id]);
db()->prepare('UPDATE qna_posts SET reply_count = GREATEST(0, reply_count - 1) WHERE id = :id')
    ->execute([':id' => $pid]);

$cnt = db()->prepare('SELECT reply_count FROM qna_posts WHERE id = :id');
$cnt->execute([':id' => $pid]);
$replyCount = (int)$cnt->fetchColumn();

json_ok(['ok' => true, 'reply_count' => $replyCount]);
