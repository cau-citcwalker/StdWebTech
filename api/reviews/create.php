<?php
/**
 * POST /api/reviews/create.php
 *   body: { rating: 1..5, body: string (>=2, <=2000) }
 *   응답: { data: { id } }
 *
 *   한 유저당 1리뷰 — 이미 있으면 409.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$rating = (int)($body['rating'] ?? 0);
$text   = trim((string)($body['body'] ?? ''));

if ($rating < 1 || $rating > 5)            json_error('평점은 1~5 사이여야 해요.', 422);
if (mb_strlen($text) < 2)                  json_error('내용을 2자 이상 입력해 주세요.', 422);
if (mb_strlen($text) > 2000)               json_error('내용이 너무 길어요 (최대 2000자).', 422);

try {
    $stmt = db()->prepare(
        'INSERT INTO site_reviews (user_id, rating, body) VALUES (:u, :r, :b)'
    );
    $stmt->execute([':u' => $uid, ':r' => $rating, ':b' => $text]);
} catch (PDOException $e) {
    if ((int)$e->errorInfo[1] === 1062) {
        json_error('이미 작성하신 리뷰가 있어요. 수정해 주세요.', 409);
    }
    throw $e;
}

json_ok(['id' => (int)db()->lastInsertId()]);
