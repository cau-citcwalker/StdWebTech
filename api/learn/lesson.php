<?php
/**
 * GET /api/learn/lesson.php?id=N
 *
 *   특정 레슨의 모든 문제를 돌려준다.
 *   응답의 questions[].answer / explanation 은 **포함하지 않는다**.
 *   채점은 서버가 submit.php 에서 진행.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('GET');
require_login();

$lessonId = (int)($_GET['id'] ?? 0);
if ($lessonId <= 0) {
    json_error('레슨 id 가 필요해요.', 422);
}

$lessonStmt = db()->prepare(
    'SELECT l.id, l.slug, l.title, l.summary, l.icon, l.xp_reward,
            u.id AS unit_id, u.title AS unit_title, u.color AS unit_color
     FROM lessons l
     JOIN units u ON u.id = l.unit_id
     WHERE l.id = :id
     LIMIT 1'
);
$lessonStmt->execute([':id' => $lessonId]);
$lesson = $lessonStmt->fetch();
if ($lesson === false) {
    json_error('레슨을 찾을 수 없어요.', 404);
}

$qStmt = db()->prepare(
    'SELECT id, type, prompt, options, sort_order
     FROM questions
     WHERE lesson_id = :id
     ORDER BY sort_order ASC, id ASC'
);
$qStmt->execute([':id' => $lessonId]);

$questions = [];
foreach ($qStmt->fetchAll() as $q) {
    $questions[] = [
        'id'      => (int)$q['id'],
        'type'    => $q['type'],
        'prompt'  => $q['prompt'],
        'options' => $q['options'] !== null ? json_decode($q['options'], true) : null,
    ];
}

json_ok([
    'lesson' => [
        'id'         => (int)$lesson['id'],
        'slug'       => $lesson['slug'],
        'title'      => $lesson['title'],
        'summary'    => $lesson['summary'],
        'icon'       => $lesson['icon'],
        'xp_reward'  => (int)$lesson['xp_reward'],
        'unit_id'    => (int)$lesson['unit_id'],
        'unit_title' => $lesson['unit_title'],
        'unit_color' => $lesson['unit_color'],
    ],
    'questions' => $questions,
]);
