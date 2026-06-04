<?php
/**
 * GET /api/reviews/list.php?sort=recent|rating_high|rating_low&filter=5,4,3,2,1&page=1
 *
 *   응답: {
 *     data: {
 *       page: 1,
 *       page_size: 10,
 *       total: int,
 *       total_pages: int,
 *       stats: { count, average, distribution: { '1':n, ..., '5':n } },
 *       my:    { id, rating, body, created_at, updated_at, author{id,username,display_name} } | null,
 *       items: [{ id, rating, body, created_at, updated_at, author{...}, is_mine }]
 *     }
 *   }
 *
 *   page_size 10 고정. filter 미지정 = 전체.
 *   my 는 페이지네이션과 별도 — 항상 응답에 포함 (오너만 알아볼 수 있게).
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('GET');
$uid = current_user_id();   // 비로그인 허용 (읽기만)

$page = max(1, (int)($_GET['page'] ?? 1));
$pageSize = 10;
$offset = ($page - 1) * $pageSize;

$sort = (string)($_GET['sort'] ?? 'recent');
$orderBy = match ($sort) {
    'rating_high' => 'r.rating DESC, r.created_at DESC',
    'rating_low'  => 'r.rating ASC,  r.created_at DESC',
    'helpful'     => 'like_count DESC, r.created_at DESC',
    default       => 'r.created_at DESC',
};

// rating 필터 (예: "5,4")
$filter = trim((string)($_GET['filter'] ?? ''));
$ratingIn = [];
if ($filter !== '') {
    foreach (explode(',', $filter) as $r) {
        $n = (int)$r;
        if ($n >= 1 && $n <= 5) $ratingIn[] = $n;
    }
}
$where = '';
$params = [];
if ($ratingIn) {
    $place = implode(',', array_fill(0, count($ratingIn), '?'));
    $where = "WHERE r.rating IN ($place)";
    $params = array_values($ratingIn);
}

// 통계 (필터/정렬 무관, 전체)
$stats = ['count' => 0, 'average' => 0, 'distribution' => ['1'=>0,'2'=>0,'3'=>0,'4'=>0,'5'=>0]];
$statRow = db()->query("SELECT COUNT(*) AS c, COALESCE(AVG(rating),0) AS a FROM site_reviews")->fetch();
$stats['count']   = (int)$statRow['c'];
$stats['average'] = round((float)$statRow['a'], 2);
$dist = db()->query("SELECT rating, COUNT(*) AS n FROM site_reviews GROUP BY rating")->fetchAll();
foreach ($dist as $d) $stats['distribution'][(string)(int)$d['rating']] = (int)$d['n'];

// 총 개수 (필터 적용된 것)
$totalSql = "SELECT COUNT(*) FROM site_reviews r $where";
$totalStmt = db()->prepare($totalSql);
$totalStmt->execute($params);
$total = (int)$totalStmt->fetchColumn();
$totalPages = max(1, (int)ceil($total / $pageSize));

// 페이지 행 — like_count + (로그인 시) i_liked 함께 가져옴
$myJoin = $uid !== null
    ? "LEFT JOIN review_likes my_like ON my_like.review_id = r.id AND my_like.user_id = :muid"
    : "";
$myCol = $uid !== null ? ", IF(my_like.review_id IS NULL, 0, 1) AS i_liked" : ", 0 AS i_liked";
$sql = "
    SELECT r.id, r.rating, r.body, r.created_at, r.updated_at,
           u.id AS author_id, u.username AS author_username, u.display_name AS author_display_name,
           COALESCE(lc.cnt, 0) AS like_count
           $myCol
    FROM site_reviews r
    JOIN users u ON u.id = r.user_id
    LEFT JOIN (SELECT review_id, COUNT(*) AS cnt FROM review_likes GROUP BY review_id) lc ON lc.review_id = r.id
    $myJoin
    $where
    ORDER BY $orderBy
    LIMIT $pageSize OFFSET $offset
";
$rowsStmt = db()->prepare($sql);
$execParams = $params;
if ($uid !== null) $execParams[':muid'] = $uid;
$rowsStmt->execute($execParams);
$rows = $rowsStmt->fetchAll();

$shape = function ($r) use ($uid) {
    return [
        'id'         => (int)$r['id'],
        'rating'     => (int)$r['rating'],
        'body'       => $r['body'],
        'created_at' => $r['created_at'],
        'updated_at' => $r['updated_at'],
        'is_mine'    => $uid !== null && (int)$r['author_id'] === $uid,
        'like_count' => (int)($r['like_count'] ?? 0),
        'i_liked'    => (bool)(int)($r['i_liked'] ?? 0),
        'author'     => [
            'id'           => (int)$r['author_id'],
            'username'     => $r['author_username'],
            'display_name' => $r['author_display_name'],
        ],
    ];
};
$items = array_map($shape, $rows);

// 내 리뷰 (있으면)
$my = null;
if ($uid !== null) {
    $myStmt = db()->prepare(
        "SELECT r.id, r.rating, r.body, r.created_at, r.updated_at,
                u.id AS author_id, u.username AS author_username, u.display_name AS author_display_name,
                COALESCE(lc.cnt, 0) AS like_count,
                0 AS i_liked
         FROM site_reviews r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN (SELECT review_id, COUNT(*) AS cnt FROM review_likes GROUP BY review_id) lc ON lc.review_id = r.id
         WHERE r.user_id = :u LIMIT 1"
    );
    $myStmt->execute([':u' => $uid]);
    $r = $myStmt->fetch();
    if ($r !== false) $my = $shape($r);
}

json_ok([
    'page'        => $page,
    'page_size'   => $pageSize,
    'total'       => $total,
    'total_pages' => $totalPages,
    'stats'       => $stats,
    'my'          => $my,
    'items'       => $items,
]);
