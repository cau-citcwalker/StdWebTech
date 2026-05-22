<?php
/**
 * GET /api/learn/map.php
 *
 *   현재 사용자의 학습 맵을 돌려준다.
 *   응답:
 *     data: {
 *       user: { id, display_name, xp, streak_days },
 *       units: [
 *         { id, slug, title, subtitle, color,
 *           lessons: [
 *             { id, slug, title, summary, icon, xp_reward,
 *               state: 'completed' | 'available' | 'locked',
 *               score_pct: number | null
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *
 *   진행도 규칙:
 *     - 단원의 첫 레슨은 항상 'available'
 *     - 그 뒤 레슨은 직전 레슨을 완료해야 'available'
 *     - 완료한 레슨은 'completed'
 *     - 그 외는 'locked'
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('GET');
$uid = require_login();

$user = load_user_by_id($uid);
if ($user === null) {
    logout_user();
    json_error('세션이 만료됐어요. 다시 로그인해 주세요.', 401);
}

// 진행도 빠르게 조회하기 위한 인덱스
$progStmt = db()->prepare(
    'SELECT lesson_id, score_pct FROM user_lesson_progress WHERE user_id = :uid'
);
$progStmt->execute([':uid' => $uid]);
$progressByLesson = [];
foreach ($progStmt->fetchAll() as $row) {
    $progressByLesson[(int)$row['lesson_id']] = (int)$row['score_pct'];
}

// 모든 단원과 레슨을 한 번에
$rows = db()->query(
    'SELECT u.id AS unit_id, u.slug AS unit_slug, u.title AS unit_title,
            u.subtitle AS unit_subtitle, u.color AS unit_color, u.sort_order AS unit_sort,
            l.id AS lesson_id, l.slug AS lesson_slug, l.title AS lesson_title,
            l.summary AS lesson_summary, l.icon AS lesson_icon,
            l.xp_reward AS lesson_xp, l.sort_order AS lesson_sort
     FROM units u
     LEFT JOIN lessons l ON l.unit_id = u.id
     ORDER BY u.sort_order ASC, l.sort_order ASC'
)->fetchAll();

$unitsById = [];
foreach ($rows as $r) {
    $uidU = (int)$r['unit_id'];
    if (!isset($unitsById[$uidU])) {
        $unitsById[$uidU] = [
            'id'       => $uidU,
            'slug'     => $r['unit_slug'],
            'title'    => $r['unit_title'],
            'subtitle' => $r['unit_subtitle'],
            'color'    => $r['unit_color'],
            'lessons'  => [],
        ];
    }
    if ($r['lesson_id'] === null) continue;
    $unitsById[$uidU]['lessons'][] = [
        'id'        => (int)$r['lesson_id'],
        'slug'      => $r['lesson_slug'],
        'title'     => $r['lesson_title'],
        'summary'   => $r['lesson_summary'],
        'icon'      => $r['lesson_icon'],
        'xp_reward' => (int)$r['lesson_xp'],
        'state'     => 'locked',
        'score_pct' => null,
    ];
}

// 진행도 + 잠금 해제 규칙 적용
foreach ($unitsById as &$unit) {
    $prevCompleted = true;          // 첫 레슨은 무조건 열림
    foreach ($unit['lessons'] as &$lesson) {
        $score = $progressByLesson[$lesson['id']] ?? null;
        if ($score !== null) {
            $lesson['state'] = 'completed';
            $lesson['score_pct'] = $score;
            $prevCompleted = true;
        } elseif ($prevCompleted) {
            $lesson['state'] = 'available';
            $prevCompleted = false;
        } else {
            $lesson['state'] = 'locked';
        }
    }
    unset($lesson);
}
unset($unit);

json_ok([
    'user'  => [
        'id'           => (int)$user['id'],
        'display_name' => $user['display_name'],
        'xp'           => (int)$user['xp'],
        'coins'        => (int)$user['coins'],
        'streak_days'  => (int)$user['streak_days'],
    ],
    'units' => array_values($unitsById),
]);
