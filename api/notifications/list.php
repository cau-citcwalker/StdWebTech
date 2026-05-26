<?php
/**
 * GET /api/notifications/list.php?only_unread=0|1&limit=N
 *   응답: { items: [...], unread: int }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/notify.php';

require_method('GET');
$uid = require_login();

$onlyUnread = !empty($_GET['only_unread']);
$limit = max(1, min(100, (int)($_GET['limit'] ?? 30)));

json_ok([
    'items'  => list_notifications($uid, $limit, $onlyUnread),
    'unread' => unread_count($uid),
]);
