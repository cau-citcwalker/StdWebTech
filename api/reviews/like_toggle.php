<?php
/**
 * POST /api/reviews/like_toggle.php
 *   body: { id }
 *   응답: { data: { liked: bool, like_count: int } }
 *
 *   본인 리뷰엔 좋아요 불가.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$id   = (int)($body['id'] ?? 0);
if ($id <= 0) json_error('id 가 필요해요.', 422);

$row = db()->prepare('SELECT user_id FROM site_reviews WHERE id = :id LIMIT 1');
$row->execute([':id' => $id]);
$ownerId = $row->fetchColumn();
if ($ownerId === false)    json_error('리뷰를 찾을 수 없어요.', 404);
if ((int)$ownerId === $uid) json_error('내 리뷰에는 좋아요 못해요.', 422);

$has = db()->prepare(
    'SELECT 1 FROM review_likes WHERE review_id = :r AND user_id = :u LIMIT 1'
);
$has->execute([':r' => $id, ':u' => $uid]);

if ($has->fetchColumn() !== false) {
    db()->prepare('DELETE FROM review_likes WHERE review_id = :r AND user_id = :u')
        ->execute([':r' => $id, ':u' => $uid]);
    $liked = false;
} else {
    db()->prepare('INSERT INTO review_likes (review_id, user_id) VALUES (:r, :u)')
        ->execute([':r' => $id, ':u' => $uid]);
    $liked = true;
}

$cnt = db()->prepare('SELECT COUNT(*) FROM review_likes WHERE review_id = :r');
$cnt->execute([':r' => $id]);
$likeCount = (int)$cnt->fetchColumn();

json_ok(['liked' => $liked, 'like_count' => $likeCount]);
