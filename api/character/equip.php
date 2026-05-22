<?php
/**
 * POST /api/character/equip.php
 *
 *   body: { slot: string, item_id: int | null }
 *     item_id = null  → 해당 슬롯 해제
 *   응답: 갱신된 equipped 객체
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/character.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$slot   = (string)($body['slot'] ?? '');
$itemId = isset($body['item_id']) && $body['item_id'] !== null
        ? (int)$body['item_id']
        : null;

if ($slot === '') json_error('slot 이 필요해요.', 422);

equip_item($uid, $slot, $itemId);

json_ok([
    'equipped' => user_equipment($uid),
]);
