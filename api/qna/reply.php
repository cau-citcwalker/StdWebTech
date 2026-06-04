<?php
/**
 * POST /api/qna/reply.php
 *   body: { post_id, body, parent_reply_id? }
 *   응답: { data: { id, reply_count } }
 *
 *   답글 추가 + qna_posts.reply_count 증분.
 *   본문에서 @username 패턴 검출 → 해당 사용자에게 notify (자기 자신 제외, 중복 제거).
 *   parent_reply_id 가 있으면 중첩 답글. 깊이 무제한이지만 frontend 는 indent 만 표시.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/notify.php';

require_method('POST');
$uid = require_login();

$body  = read_json_body();
$pid   = (int)($body['post_id'] ?? 0);
$pRid  = isset($body['parent_reply_id']) && $body['parent_reply_id'] !== null
        ? (int)$body['parent_reply_id'] : null;
$text  = trim((string)($body['body'] ?? ''));

if ($pid <= 0) json_error('post_id 가 필요해요.', 422);
if (mb_strlen($text) < 2 || mb_strlen($text) > 5000) json_error('답글은 2~5000자.', 422);

// 게시글 존재 확인
$has = db()->prepare('SELECT user_id FROM qna_posts WHERE id = :id LIMIT 1');
$has->execute([':id' => $pid]);
$postOwner = $has->fetchColumn();
if ($postOwner === false) json_error('게시글을 찾을 수 없어요.', 404);
$postOwner = (int)$postOwner;

// parent reply 존재 + 같은 post 확인
$parentOwner = null;
if ($pRid !== null) {
    $pStmt = db()->prepare('SELECT user_id, post_id FROM qna_replies WHERE id = :id LIMIT 1');
    $pStmt->execute([':id' => $pRid]);
    $pr = $pStmt->fetch();
    if ($pr === false) json_error('답글을 찾을 수 없어요.', 404);
    if ((int)$pr['post_id'] !== $pid) json_error('답글이 이 게시글에 속하지 않아요.', 422);
    $parentOwner = (int)$pr['user_id'];
}

$ins = db()->prepare(
    'INSERT INTO qna_replies (post_id, user_id, parent_reply_id, body) VALUES (:p, :u, :pr, :b)'
);
$ins->execute([':p' => $pid, ':u' => $uid, ':pr' => $pRid, ':b' => $text]);
$id = (int)db()->lastInsertId();

db()->prepare('UPDATE qna_posts SET reply_count = reply_count + 1 WHERE id = :id')
    ->execute([':id' => $pid]);

$cnt = db()->prepare('SELECT reply_count FROM qna_posts WHERE id = :id');
$cnt->execute([':id' => $pid]);
$replyCount = (int)$cnt->fetchColumn();

// --- 알림 분기 ----------------------------------------------------------------
$notifyIds = [];
// (1) 부모 답글이 있으면 그 답글 작성자에게 알림 ("내 답글에 답변")
if ($parentOwner !== null && $parentOwner !== $uid) $notifyIds[] = $parentOwner;
// (2) 부모 답글이 없으면 게시글 작성자에게 알림 ("내 글에 새 답글")
if ($parentOwner === null && $postOwner !== $uid) $notifyIds[] = $postOwner;

// (3) @mention 알림 — 본문에서 @\w+ 검출 후 username 매칭
preg_match_all('/@([A-Za-z0-9_]{3,40})/', $text, $matches);
$mentioned = array_unique($matches[1] ?? []);
if ($mentioned) {
    $place = implode(',', array_fill(0, count($mentioned), '?'));
    $mStmt = db()->prepare("SELECT id FROM users WHERE username IN ($place)");
    $mStmt->execute($mentioned);
    foreach ($mStmt->fetchAll(PDO::FETCH_COLUMN) as $mid) {
        $mid = (int)$mid;
        if ($mid !== $uid && !in_array($mid, $notifyIds, true)) $notifyIds[] = $mid;
    }
}

// 발송 (중복 제거 후)
$snippet = mb_substr($text, 0, 80) . (mb_strlen($text) > 80 ? '…' : '');
$me = load_user_by_id($uid);
$meName = $me['display_name'] ?? '누군가';
$postTitleStmt = db()->prepare('SELECT title FROM qna_posts WHERE id = :id');
$postTitleStmt->execute([':id' => $pid]);
$postTitle = (string)$postTitleStmt->fetchColumn();

foreach (array_unique($notifyIds) as $nUid) {
    $title = $parentOwner === $nUid
        ? "{$meName} 님이 내 답글에 답했어요"
        : (in_array($nUid, $mentioned, true) || ($postOwner !== $nUid && $parentOwner === null)
            ? "{$meName} 님이 답글을 남겼어요"
            : "{$meName} 님이 답글을 남겼어요");
    notify((int)$nUid, 'system', $title, $snippet, "/qna_post.html?id={$pid}#reply-{$id}");
}

json_ok(['id' => $id, 'reply_count' => $replyCount]);
