<?php
/**
 * GET /api/friends/list.php
 *
 *   응답:
 *     data: {
 *       friends:  [ {id, username, display_name, xp, streak_days } ],
 *       incoming: [ {request_id, from: {...}} ],   // 나에게 들어온 신청
 *       outgoing: [ {request_id, to:   {...}} ],   // 내가 보낸 신청
 *     }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/friends.php';

require_method('GET');
$uid = require_login();

// 친구 (accepted, 양방향)
$friendsStmt = db()->prepare(
    "SELECT u.id, u.username, u.display_name, u.xp, u.streak_days
     FROM friendships f
     JOIN users u ON u.id = IF(f.requester_id = :uid, f.addressee_id, f.requester_id)
     WHERE f.status = 'accepted'
       AND (f.requester_id = :uid OR f.addressee_id = :uid)
     ORDER BY u.display_name"
);
$friendsStmt->execute([':uid' => $uid]);
$friends = array_map('friend_summary_row', $friendsStmt->fetchAll());

// 들어온 신청
$inStmt = db()->prepare(
    "SELECT f.id AS request_id, u.id, u.username, u.display_name, u.xp, u.streak_days
     FROM friendships f
     JOIN users u ON u.id = f.requester_id
     WHERE f.addressee_id = :uid AND f.status = 'pending'
     ORDER BY f.created_at DESC"
);
$inStmt->execute([':uid' => $uid]);
$incoming = array_map(function ($r) {
    return [
        'request_id' => (int)$r['request_id'],
        'from'       => friend_summary_row($r),
    ];
}, $inStmt->fetchAll());

// 보낸 신청
$outStmt = db()->prepare(
    "SELECT f.id AS request_id, u.id, u.username, u.display_name, u.xp, u.streak_days
     FROM friendships f
     JOIN users u ON u.id = f.addressee_id
     WHERE f.requester_id = :uid AND f.status = 'pending'
     ORDER BY f.created_at DESC"
);
$outStmt->execute([':uid' => $uid]);
$outgoing = array_map(function ($r) {
    return [
        'request_id' => (int)$r['request_id'],
        'to'         => friend_summary_row($r),
    ];
}, $outStmt->fetchAll());

json_ok([
    'friends'  => $friends,
    'incoming' => $incoming,
    'outgoing' => $outgoing,
]);
