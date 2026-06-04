<?php
/**
 * GET /api/qna/get.php?id=N
 *   응답: { data: { post: {...full...}, replies: [...] } }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('GET');
$uid = current_user_id();
$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) json_error('id 가 필요해요.', 422);

$ps = db()->prepare(
    "SELECT p.id, p.category, p.title, p.body, p.reply_count, p.created_at, p.updated_at,
            u.id AS author_id, u.username AS author_username, u.display_name AS author_display_name
     FROM qna_posts p JOIN users u ON u.id = p.user_id
     WHERE p.id = :id LIMIT 1"
);
$ps->execute([':id' => $id]);
$row = $ps->fetch();
if ($row === false) json_error('게시글을 찾을 수 없어요.', 404);

$post = [
    'id'         => (int)$row['id'],
    'category'   => $row['category'],
    'title'      => $row['title'],
    'body'       => $row['body'],
    'reply_count'=> (int)$row['reply_count'],
    'created_at' => $row['created_at'],
    'updated_at' => $row['updated_at'],
    'is_mine'    => $uid !== null && (int)$row['author_id'] === $uid,
    'author'     => [
        'id'           => (int)$row['author_id'],
        'username'     => $row['author_username'],
        'display_name' => $row['author_display_name'],
    ],
];

$rs = db()->prepare(
    "SELECT r.id, r.body, r.created_at, r.updated_at,
            u.id AS author_id, u.username AS author_username, u.display_name AS author_display_name
     FROM qna_replies r JOIN users u ON u.id = r.user_id
     WHERE r.post_id = :pid
     ORDER BY r.created_at ASC"
);
$rs->execute([':pid' => $id]);
$replies = array_map(function($r) use ($uid) {
    return [
        'id'         => (int)$r['id'],
        'body'       => $r['body'],
        'created_at' => $r['created_at'],
        'updated_at' => $r['updated_at'],
        'is_mine'    => $uid !== null && (int)$r['author_id'] === $uid,
        'author' => [
            'id'           => (int)$r['author_id'],
            'username'     => $r['author_username'],
            'display_name' => $r['author_display_name'],
        ],
    ];
}, $rs->fetchAll());

json_ok(['post' => $post, 'replies' => $replies]);
