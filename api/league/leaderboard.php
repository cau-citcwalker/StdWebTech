<?php
/**
 * GET /api/league/leaderboard.php
 *
 *   응답:
 *     data: {
 *       me: {
 *         user: { id, display_name, username },
 *         total_xp, weekly_xp,
 *         tier: { key, name, min, color },
 *         next_tier: { ..., to_go: int } | null,
 *         weekly_rank: int | null,
 *         total_rank: int | null
 *       },
 *       weekly: [ { user_id, display_name, username, weekly_xp, total_xp, tier }, ... top 50 ],
 *       hall_of_fame: [ { user_id, display_name, username, total_xp, tier }, ... top 20 ],
 *       week_start: 'YYYY-MM-DD'
 *     }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/league.php';

require_method('GET');
$uid = require_login();

$me = load_user_by_id($uid);
if ($me === null) {
    logout_user();
    json_error('세션이 만료됐어요.', 401);
}

$weekStart = week_start_date();

/** 한 사용자의 “이번 주 XP” */
function fetch_weekly_xp_map(string $weekStart): array
{
    $stmt = db()->prepare(
        "SELECT p.user_id, COALESCE(SUM(l.xp_reward), 0) AS xp
         FROM user_lesson_progress p
         JOIN lessons l ON l.id = p.lesson_id
         WHERE p.completed_at >= :w
         GROUP BY p.user_id"
    );
    $stmt->execute([':w' => $weekStart . ' 00:00:00']);
    $out = [];
    foreach ($stmt->fetchAll() as $r) $out[(int)$r['user_id']] = (int)$r['xp'];
    return $out;
}

$weeklyMap = fetch_weekly_xp_map($weekStart);

// ----- 주간 리더보드 (이번 주 XP > 0 인 사용자만) -----
$weeklyTop = [];
if (!empty($weeklyMap)) {
    $ids = implode(',', array_keys($weeklyMap));
    $rows = db()->query(
        "SELECT id, username, display_name, xp AS total_xp
         FROM users WHERE id IN ($ids)"
    )->fetchAll();
    foreach ($rows as $r) {
        $weeklyTop[] = [
            'user_id'      => (int)$r['id'],
            'username'     => $r['username'],
            'display_name' => $r['display_name'],
            'weekly_xp'    => $weeklyMap[(int)$r['id']],
            'total_xp'     => (int)$r['total_xp'],
            'tier'         => tier_for_xp((int)$r['total_xp']),
        ];
    }
    usort($weeklyTop, fn($a, $b) => $b['weekly_xp'] - $a['weekly_xp']);
    $weeklyTop = array_slice($weeklyTop, 0, 50);
}

// 본인 이번 주 순위 (전체 사용자 중)
$allWeeklyRanked = $weeklyMap;
arsort($allWeeklyRanked);
$weeklyRank = null;
$rank = 0;
foreach (array_keys($allWeeklyRanked) as $userId) {
    $rank++;
    if ($userId === $uid) { $weeklyRank = $rank; break; }
}

// ----- 명예의 전당 (누적 XP) -----
$hallStmt = db()->query(
    "SELECT id, username, display_name, xp FROM users ORDER BY xp DESC, id ASC LIMIT 20"
);
$hall = array_map(function ($r) {
    return [
        'user_id'      => (int)$r['id'],
        'username'     => $r['username'],
        'display_name' => $r['display_name'],
        'total_xp'     => (int)$r['xp'],
        'tier'         => tier_for_xp((int)$r['xp']),
    ];
}, $hallStmt->fetchAll());

// 본인 누적 순위
$rankStmt = db()->prepare(
    "SELECT 1 + COUNT(*) AS r FROM users WHERE xp > :myxp"
);
$rankStmt->execute([':myxp' => (int)$me['xp']]);
$totalRank = (int)$rankStmt->fetchColumn();

$myTier = tier_for_xp((int)$me['xp']);
$myNext = next_tier($myTier);
if ($myNext !== null) {
    $myNext['to_go'] = max(0, $myNext['min'] - (int)$me['xp']);
}

json_ok([
    'me' => [
        'user'        => [
            'id'           => (int)$me['id'],
            'username'     => $me['username'],
            'display_name' => $me['display_name'],
        ],
        'total_xp'    => (int)$me['xp'],
        'weekly_xp'   => $weeklyMap[$uid] ?? 0,
        'tier'        => $myTier,
        'next_tier'   => $myNext,
        'weekly_rank' => $weeklyRank,
        'total_rank'  => $totalRank,
    ],
    'weekly'       => $weeklyTop,
    'hall_of_fame' => $hall,
    'tiers'        => LEAGUE_TIERS,
    'week_start'   => $weekStart,
]);
