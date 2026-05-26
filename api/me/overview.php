<?php
/**
 * GET /api/me/overview.php
 *
 *   내 대시보드 데이터 — 한 번에:
 *     - user       : 기본 프로필 + xp / coins / streak / joined
 *     - counters   : 완료 레슨 / 친구 수 / 보유 아이템 수 / 총 단원 진행률
 *     - weekly_xp  : [{ date: 'YYYY-MM-DD', xp: int }, ...] (지난 7일)
 *     - recent     : [{ lesson_id, title, unit_title, score_pct, completed_at }, ...] 최근 8개
 *     - equipped   : { slot: item_id }
 *     - items      : 카탈로그 (마스코트 합성용)
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/character.php';

require_method('GET');
$uid = require_login();

$user = load_user_by_id($uid);
if ($user === null) {
    logout_user();
    json_error('세션이 만료됐어요.', 401);
}

// ----- 카운터 -----
$cntStmt = db()->prepare(
    "SELECT
        (SELECT COUNT(*) FROM user_lesson_progress WHERE user_id = :u) AS done_lessons,
        (SELECT COUNT(*) FROM friendships
            WHERE status = 'accepted'
              AND (requester_id = :u OR addressee_id = :u)) AS friends,
        (SELECT COUNT(*) FROM user_items WHERE user_id = :u) AS owned_items,
        (SELECT COUNT(*) FROM lessons) AS total_lessons"
);
$cntStmt->execute([':u' => $uid]);
$counters = $cntStmt->fetch();
$counters = array_map('intval', $counters);

// ----- 지난 7일 XP 추이 -----
//   user_lesson_progress.completed_at 의 날짜별 합산을 한다.
//   재도전(이미 깬 레슨) 도 lessons.xp_reward 의 절반이 지급되지만
//   여기서는 단순화해서 lesson.xp_reward 전액 기준으로 표시 (대략적 추이).
$weeklyStmt = db()->prepare(
    "SELECT DATE(p.completed_at) AS d, COALESCE(SUM(l.xp_reward), 0) AS xp
     FROM user_lesson_progress p
     JOIN lessons l ON l.id = p.lesson_id
     WHERE p.user_id = :u
       AND p.completed_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(p.completed_at)"
);
$weeklyStmt->execute([':u' => $uid]);
$byDay = [];
foreach ($weeklyStmt->fetchAll() as $r) $byDay[$r['d']] = (int)$r['xp'];

$weekly = [];
for ($i = 6; $i >= 0; $i--) {
    $d = date('Y-m-d', strtotime("-$i days"));
    $weekly[] = ['date' => $d, 'xp' => $byDay[$d] ?? 0];
}

// ----- 최근 완료 레슨 -----
$recentStmt = db()->prepare(
    "SELECT p.lesson_id, l.title, u.title AS unit_title, p.score_pct, p.completed_at
     FROM user_lesson_progress p
     JOIN lessons l ON l.id = p.lesson_id
     JOIN units u   ON u.id = l.unit_id
     WHERE p.user_id = :u
     ORDER BY p.completed_at DESC
     LIMIT 8"
);
$recentStmt->execute([':u' => $uid]);
$recent = array_map(function ($r) {
    return [
        'lesson_id'    => (int)$r['lesson_id'],
        'title'        => $r['title'],
        'unit_title'   => $r['unit_title'],
        'score_pct'    => (int)$r['score_pct'],
        'completed_at' => $r['completed_at'],
    ];
}, $recentStmt->fetchAll());

ensure_starter_items($uid);
$equipped = user_equipment($uid);

json_ok([
    'user' => [
        'id'           => (int)$user['id'],
        'username'     => $user['username'],
        'display_name' => $user['display_name'],
        'email'        => $user['email'],
        'xp'           => (int)$user['xp'],
        'coins'        => (int)$user['coins'],
        'streak_days'  => (int)$user['streak_days'],
        'joined_at'    => $user['created_at'],
    ],
    'counters' => $counters,
    'weekly_xp' => $weekly,
    'recent'    => $recent,
    'equipped'  => $equipped,
    'items'     => list_items(),
]);
