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

// FK CASCADE 로 children (그리고 그 아래 grand-children) 까지 함께 삭제되므로,
// reply_count 도 그만큼 차감해야 desync 안 됨.
// DELETE 전후의 같은 post 의 reply 개수 차이를 측정해서 그만큼 감산.
$beforeStmt = db()->prepare('SELECT COUNT(*) FROM qna_replies WHERE post_id = :pid');
$beforeStmt->execute([':pid' => $pid]);
$before = (int)$beforeStmt->fetchColumn();

db()->prepare('DELETE FROM qna_replies WHERE id = :id')->execute([':id' => $id]);

$afterStmt = db()->prepare('SELECT COUNT(*) FROM qna_replies WHERE post_id = :pid');
$afterStmt->execute([':pid' => $pid]);
$after = (int)$afterStmt->fetchColumn();

$removed = $before - $after;
if ($removed > 0) {
    db()->prepare('UPDATE qna_posts SET reply_count = GREATEST(0, reply_count - :n) WHERE id = :id')
        ->execute([':n' => $removed, ':id' => $pid]);
}

$cnt = db()->prepare('SELECT reply_count FROM qna_posts WHERE id = :id');
$cnt->execute([':id' => $pid]);
$replyCount = (int)$cnt->fetchColumn();

json_ok(['ok' => true, 'reply_count' => $replyCount]);
