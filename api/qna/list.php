<?php
/**
 * GET /api/qna/list.php?category=all|<key>&sort=recent|reply_count&page=N&q=search
 *
 *   응답: { data: { page, page_size, total, total_pages, items: [{
 *     id, title, body (200자 preview), category, reply_count,
 *     created_at, updated_at, author{id,username,display_name}
 *   }]} }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('GET');

$page = max(1, (int)($_GET['page'] ?? 1));
$pageSize = 10;
$offset = ($page - 1) * $pageSize;

$sort = (string)($_GET['sort'] ?? 'recent');
$orderBy = match ($sort) {
    'reply_count' => 'p.reply_count DESC, p.created_at DESC',
    default       => 'p.created_at DESC',
};

$category = (string)($_GET['category'] ?? 'all');
$q = trim((string)($_GET['q'] ?? ''));

$where = [];
$params = [];

if ($category !== 'all' && $category !== '') {
    $where[] = 'p.category = :cat';
    $params[':cat'] = $category;
}
if ($q !== '') {
    $where[] = '(p.title LIKE :q OR p.body LIKE :q)';
    $params[':q'] = '%' . $q . '%';
}
$whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

$totalStmt = db()->prepare("SELECT COUNT(*) FROM qna_posts p $whereSql");
$totalStmt->execute($params);
$total = (int)$totalStmt->fetchColumn();
$totalPages = max(1, (int)ceil($total / $pageSize));

$sql = "
    SELECT p.id, p.category, p.title, p.body, p.reply_count, p.created_at, p.updated_at,
           u.id AS author_id, u.username AS author_username, u.display_name AS author_display_name
    FROM qna_posts p
    JOIN users u ON u.id = p.user_id
    $whereSql
    ORDER BY $orderBy
    LIMIT $pageSize OFFSET $offset
";
$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$items = array_map(function($r){
    $preview = mb_substr($r['body'], 0, 200);
    return [
        'id'          => (int)$r['id'],
        'category'    => $r['category'],
        'title'       => $r['title'],
        'body'        => $preview . (mb_strlen($r['body']) > 200 ? '…' : ''),
        'reply_count' => (int)$r['reply_count'],
        'created_at'  => $r['created_at'],
        'updated_at'  => $r['updated_at'],
        'author' => [
            'id'           => (int)$r['author_id'],
            'username'     => $r['author_username'],
            'display_name' => $r['author_display_name'],
        ],
    ];
}, $rows);

json_ok([
    'page'        => $page,
    'page_size'   => $pageSize,
    'total'       => $total,
    'total_pages' => $totalPages,
    'items'       => $items,
]);
