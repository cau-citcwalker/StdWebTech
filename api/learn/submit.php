<?php
/**
 * POST /api/learn/submit.php
 *
 *   body: { lesson_id: int, answers: { [question_id]: string } }
 *
 *   응답:
 *     data: {
 *       results: [
 *         { question_id, correct: bool, your_answer, answer, explanation }
 *       ],
 *       summary: {
 *         correct, total, score_pct,
 *         xp_awarded,                  // 첫 완주 보너스 포함
 *         already_completed: bool      // 이미 깬 레슨이면 보너스 XP 없음
 *       },
 *       user: { xp, streak_days }
 *     }
 *
 *   채점은 서버가 단독으로 수행한다. 클라이언트가 정답을 알 일이 없게.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/coins.php';

const COIN_REWARD_FIRST_PASS = 10;
const COIN_REWARD_RETRY      = 3;
const COIN_REWARD_STREAK_7   = 50;   // D-7 / D-14 / D-21 ... 도달 시

require_method('POST');
$uid = require_login();

$body = read_json_body();
$lessonId = (int)($body['lesson_id'] ?? 0);
$answers  = (array)($body['answers'] ?? []);
if ($lessonId <= 0) json_error('lesson_id 가 필요해요.', 422);

$lessonStmt = db()->prepare('SELECT id, xp_reward FROM lessons WHERE id = :id LIMIT 1');
$lessonStmt->execute([':id' => $lessonId]);
$lesson = $lessonStmt->fetch();
if ($lesson === false) json_error('레슨을 찾을 수 없어요.', 404);

$qStmt = db()->prepare(
    'SELECT id, type, prompt, options, answer, explanation
     FROM questions
     WHERE lesson_id = :id
     ORDER BY sort_order ASC, id ASC'
);
$qStmt->execute([':id' => $lessonId]);
$questions = $qStmt->fetchAll();

if (count($questions) === 0) {
    json_error('이 레슨에는 아직 문제가 없어요.', 400);
}

$results = [];
$correctCount = 0;
foreach ($questions as $q) {
    $qid = (int)$q['id'];
    $raw = isset($answers[$qid]) ? $answers[$qid] : ($answers[(string)$qid] ?? null);
    $given = is_string($raw) ? trim($raw) : (is_scalar($raw) ? (string)$raw : '');
    $expected = trim((string)$q['answer']);

    $isCorrect = false;
    if ($given !== '') {
        if ($q['type'] === 'fill_blank') {
            $isCorrect = mb_strtolower($given) === mb_strtolower($expected);
        } else {
            $isCorrect = $given === $expected;
        }
    }

    if ($isCorrect) $correctCount++;
    $results[] = [
        'question_id'  => $qid,
        'correct'      => $isCorrect,
        'your_answer'  => $given,
        'answer'       => $expected,
        'explanation'  => $q['explanation'],
    ];
}

$total    = count($questions);
$scorePct = (int)round(100 * $correctCount / $total);

// 이미 푼 적이 있는지
$existStmt = db()->prepare(
    'SELECT id, score_pct FROM user_lesson_progress
     WHERE user_id = :u AND lesson_id = :l LIMIT 1'
);
$existStmt->execute([':u' => $uid, ':l' => $lessonId]);
$exist = $existStmt->fetch();
$alreadyCompleted = ($exist !== false);

$xpAwarded = 0;

// 통과 기준: 80% 이상
$passed = $scorePct >= 80;

if ($passed) {
    if (!$alreadyCompleted) {
        // 처음 완주 → 정상 XP
        $xpAwarded = (int)$lesson['xp_reward'];
        $ins = db()->prepare(
            'INSERT INTO user_lesson_progress
              (user_id, lesson_id, score_pct, correct_count, total_count)
             VALUES (:u, :l, :s, :c, :t)'
        );
        $ins->execute([
            ':u' => $uid, ':l' => $lessonId,
            ':s' => $scorePct, ':c' => $correctCount, ':t' => $total,
        ]);
    } else {
        // 재도전 → 점수만 갱신, 보너스는 절반 (학습 효과 인정)
        $xpAwarded = (int)floor(($lesson['xp_reward'] ?? 10) / 2);
        $upd = db()->prepare(
            'UPDATE user_lesson_progress
                SET score_pct     = GREATEST(score_pct, :s),
                    correct_count = :c,
                    total_count   = :t
              WHERE id = :id'
        );
        $upd->execute([
            ':s'  => $scorePct, ':c' => $correctCount, ':t' => $total,
            ':id' => $exist['id'],
        ]);
    }

    // 스트릭: 직전 “완료” 시점을 기준으로 계산
    //   - 어제 완료 → +1
    //   - 오늘 이미 완료 → 그대로
    //   - 그 외 (처음 또는 이틀 이상 공백) → 1 로 리셋
    $userRow = load_user_by_id($uid);
    $newStreak = (int)$userRow['streak_days'];

    $excludeId = $exist ? (int)$exist['id'] : 0;
    $lastDayStmt = db()->prepare(
        'SELECT DATE(MAX(completed_at))
           FROM user_lesson_progress
          WHERE user_id = :u AND id <> :ex'
    );
    $lastDayStmt->execute([':u' => $uid, ':ex' => $excludeId]);
    $lastDay = $lastDayStmt->fetchColumn();

    $today     = date('Y-m-d');
    $yesterday = date('Y-m-d', strtotime('-1 day'));
    if (!$lastDay) {
        $newStreak = 1;                              // 첫 완료
    } elseif ($lastDay === $today) {
        $newStreak = max(1, $newStreak);             // 오늘 이미 완료
    } elseif ($lastDay === $yesterday) {
        $newStreak = max(1, $newStreak) + 1;         // 어제 완료 → +1
    } else {
        $newStreak = 1;                              // 끊김
    }

    $prevStreak = (int)$userRow['streak_days'];

    db()->prepare(
        'UPDATE users
           SET xp = xp + :gain,
               streak_days = :s,
               last_active_at = NOW()
         WHERE id = :id'
    )->execute([':gain' => $xpAwarded, ':s' => $newStreak, ':id' => $uid]);

    // 코인 지급
    $coinDelta = $alreadyCompleted ? COIN_REWARD_RETRY : COIN_REWARD_FIRST_PASS;
    award_coins($uid, $coinDelta, $alreadyCompleted ? 'lesson_retry' : 'lesson_pass', 'lesson', $lessonId);

    // 스트릭 7 의 배수에 새로 도달 시 보너스
    if ($newStreak > $prevStreak
        && $newStreak % 7 === 0
        && $newStreak >= 7) {
        award_coins($uid, COIN_REWARD_STREAK_7, 'streak_bonus', 'streak', $newStreak);
        $coinDelta += COIN_REWARD_STREAK_7;
    }
}

$user = load_user_by_id($uid);

json_ok([
    'results' => $results,
    'summary' => [
        'correct'           => $correctCount,
        'total'             => $total,
        'score_pct'         => $scorePct,
        'passed'            => $passed,
        'xp_awarded'        => $xpAwarded,
        'already_completed' => $alreadyCompleted,
    ],
    'user' => [
        'xp'          => (int)$user['xp'],
        'coins'       => (int)$user['coins'],
        'streak_days' => (int)$user['streak_days'],
    ],
    'rewards' => [
        'xp_awarded'    => $xpAwarded,
        'coins_awarded' => isset($coinDelta) ? $coinDelta : 0,
    ],
]);
