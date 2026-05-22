<?php
/**
 * POST /api/learn/grade.php
 *
 *   body: { question_id: int, answer: string }
 *
 *   응답:
 *     data: {
 *       correct: bool,
 *       answer: string,
 *       explanation: string | null,
 *       type: string
 *     }
 *
 *   주의: 진행도/ XP 갱신 없음. 한 문제 정답 즉시 확인용.
 *   레슨 전체가 끝나면 submit.php 로 다시 일괄 제출해 진행도 기록.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
require_login();

$body = read_json_body();
$qid    = (int)($body['question_id'] ?? 0);
$answer = (string)($body['answer'] ?? '');
if ($qid <= 0) json_error('question_id 가 필요해요.', 422);

$stmt = db()->prepare(
    'SELECT id, type, answer, explanation FROM questions WHERE id = :id LIMIT 1'
);
$stmt->execute([':id' => $qid]);
$q = $stmt->fetch();
if ($q === false) json_error('문제를 찾을 수 없어요.', 404);

$given    = trim($answer);
$expected = trim((string)$q['answer']);

$correct = false;
if ($given !== '') {
    if ($q['type'] === 'fill_blank') {
        $correct = mb_strtolower($given) === mb_strtolower($expected);
    } else {
        $correct = $given === $expected;
    }
}

json_ok([
    'correct'     => $correct,
    'answer'      => $expected,
    'explanation' => $q['explanation'],
    'type'        => $q['type'],
]);
