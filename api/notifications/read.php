<?php
/**
 * POST /api/notifications/read.php
 *   body: { id?: int }     id 가 없으면 전체 읽음 처리
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/notify.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$id = isset($body['id']) ? (int)$body['id'] : null;
if ($id === 0) $id = null;

mark_notification_read($uid, $id);
json_ok(['unread' => unread_count($uid)]);
