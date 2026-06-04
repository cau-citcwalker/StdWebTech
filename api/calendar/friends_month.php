<?php
/**
 * GET /api/calendar/friends_month.php?year=Y&month=M
 *
 *   응답: { data: {
 *     year, month,
 *     friends_completed_by_date: { "2026-06-01": [{user_id, display_name, username}, ...], ... },
 *     total_friends: int
 *   }}
 *
 *   친구 (accepted) 들이 이 달에 레슨 푼 날짜 별 그룹.
 *   사용자 본인 캘린더 위에 옅게 오버레이해서 친구 활동 시각화.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('GET');
$uid = require_login();

$year  = (int)($_GET['year']  ?? 0);
$month = (int)($_GET['month'] ?? 0);
if ($year < 2000 || $year > 2100 || $month < 1 || $month > 12) {
    json_error('year/month 값이 올바르지 않아요.', 422);
}
$start = sprintf('%04d-%02d-01', $year, $month);
$end   = date('Y-m-t', strtotime($start));

// 친구 id 목록
$friendsStmt = db()->prepare(
    "SELECT IF(f.requester_id = :uid, f.addressee_id, f.requester_id) AS fid
     FROM friendships f
     WHERE f.status = 'accepted'
       AND (f.requester_id = :uid OR f.addressee_id = :uid)"
);
$friendsStmt->execute([':uid' => $uid]);
$friendIds = array_map('intval', $friendsStmt->fetchAll(PDO::FETCH_COLUMN));
$total = count($friendIds);

$byDate = [];
if ($friendIds) {
    $in = implode(',', $friendIds);
    $sql = "
        SELECT DATE(ulp.completed_at) AS d,
               u.id, u.username, u.display_name
        FROM user_lesson_progress ulp
        JOIN users u ON u.id = ulp.user_id
        WHERE ulp.user_id IN ($in)
          AND ulp.completed_at >= :s
          AND ulp.completed_at <= CONCAT(:e, ' 23:59:59')
        GROUP BY DATE(ulp.completed_at), u.id
        ORDER BY d
    ";
    $stmt = db()->prepare($sql);
    $stmt->execute([':s' => $start, ':e' => $end]);
    foreach ($stmt->fetchAll() as $r) {
        $byDate[$r['d']] ??= [];
        $byDate[$r['d']][] = [
            'user_id'      => (int)$r['id'],
            'username'     => $r['username'],
            'display_name' => $r['display_name'],
        ];
    }
}

json_ok([
    'year'  => $year,
    'month' => $month,
    'friends_completed_by_date' => $byDate,
    'total_friends' => $total,
]);
