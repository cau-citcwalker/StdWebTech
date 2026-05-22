<?php
/**
 * GET /api/character/state.php
 *
 *   현재 사용자의 옷장 상태를 한 번에 돌려준다.
 *     - items   : 전체 아이템 카탈로그
 *     - owned   : 사용자가 보유한 item_id 배열
 *     - equipped: { slot: item_id }
 *     - coins   : 현재 코인 잔액 (마켓 호환을 위해 같이 전달)
 *
 *   첫 호출 시 starter 아이템을 자동으로 사용자에게 지급한다.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/character.php';

require_method('GET');
$uid = require_login();

ensure_starter_items($uid);

$user = load_user_by_id($uid);
$items = list_items();
$owned = array_keys(user_owned_items($uid));
$equipped = user_equipment($uid);

json_ok([
    'items'    => $items,
    'owned'    => array_map('intval', $owned),
    'equipped' => $equipped,
    'coins'    => (int)$user['coins'],
    'user'     => [
        'id'           => (int)$user['id'],
        'display_name' => $user['display_name'],
    ],
]);
