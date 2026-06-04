<?php
/**
 * GET /api/calendar/month.php?year=Y&month=M
 *   응답: { data: {
 *     year, month,
 *     completed_dates: ['2026-06-01', ...],  // 레슨 완료한 날 (user_lesson_progress)
 *     events: [ {id, event_date, title, note, created_at} ],
 *     stats: { streak_days, completed_count_in_month, total_lessons_completed }
 *   }}
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
$end   = date('Y-m-t', strtotime($start));  // 해당 월 마지막 날

// 완료한 레슨 날짜 (DISTINCT DATE)
$cs = db()->prepare(
    "SELECT DISTINCT DATE(completed_at) AS d
     FROM user_lesson_progress
     WHERE user_id = :u
       AND completed_at >= :s
       AND completed_at <= CONCAT(:e, ' 23:59:59')
     ORDER BY d"
);
$cs->execute([':u' => $uid, ':s' => $start, ':e' => $end]);
$completed = array_map(fn($r) => $r['d'], $cs->fetchAll());

// 이벤트
$es = db()->prepare(
    "SELECT id, event_date, title, note, created_at
     FROM study_events
     WHERE user_id = :u AND event_date BETWEEN :s AND :e
     ORDER BY event_date, id"
);
$es->execute([':u' => $uid, ':s' => $start, ':e' => $end]);
$events = array_map(function($r){
    return [
        'id'         => (int)$r['id'],
        'event_date' => $r['event_date'],
        'title'      => $r['title'],
        'note'       => $r['note'],
        'created_at' => $r['created_at'],
    ];
}, $es->fetchAll());

// 통계
$user = load_user_by_id($uid);
$totalDone = (int)db()->prepare(
    'SELECT COUNT(*) FROM user_lesson_progress WHERE user_id = :u'
);
$tDoneStmt = db()->prepare('SELECT COUNT(*) FROM user_lesson_progress WHERE user_id = :u');
$tDoneStmt->execute([':u' => $uid]);

json_ok([
    'year'  => $year,
    'month' => $month,
    'completed_dates' => $completed,
    'events' => $events,
    'stats' => [
        'streak_days'              => (int)($user['streak_days'] ?? 0),
        'completed_count_in_month' => count($completed),
        'total_lessons_completed'  => (int)$tDoneStmt->fetchColumn(),
    ],
]);
