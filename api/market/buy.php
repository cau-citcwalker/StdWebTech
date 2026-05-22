<?php
/**
 * POST /api/market/buy.php
 *
 *   body: { item_id: int }
 *
 *   응답:
 *     data: {
 *       item:   { id, slug, name, slot, price, rarity },
 *       coins:  새 잔액,
 *       owned:  [id, ...]
 *     }
 *
 *   - 이미 보유중이면 409
 *   - 코인 부족이면 402 (Payment Required)
 *   - 트랜잭션 처리 (코인 차감 + 인벤토리 추가 + 원장 한 줄)
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';
require __DIR__ . '/../_lib/coins.php';
require __DIR__ . '/../_lib/character.php';

require_method('POST');
$uid = require_login();

$body = read_json_body();
$itemId = (int)($body['item_id'] ?? 0);
if ($itemId <= 0) json_error('item_id 가 필요해요.', 422);

$stmt = db()->prepare(
    'SELECT id, slug, name, slot, price, rarity FROM items WHERE id = :id LIMIT 1'
);
$stmt->execute([':id' => $itemId]);
$item = $stmt->fetch();
if ($item === false) json_error('아이템을 찾을 수 없어요.', 404);

// 이미 보유 중?
$check = db()->prepare(
    'SELECT 1 FROM user_items WHERE user_id = :u AND item_id = :i LIMIT 1'
);
$check->execute([':u' => $uid, ':i' => $itemId]);
if ($check->fetchColumn() !== false) {
    json_error('이미 보유하고 있는 아이템이에요.', 409);
}

$price = (int)$item['price'];

// 잔액 확인 (race condition 은 award_coins 가 트랜잭션 + SELECT FOR UPDATE 로 처리)
$user = load_user_by_id($uid);
if ((int)$user['coins'] < $price) {
    json_error('코인이 부족해요. 레슨을 풀고 다시 와보세요.', 402);
}

// 트랜잭션: 코인 차감 → 인벤토리 추가
db()->beginTransaction();
try {
    award_coins($uid, -$price, 'purchase', 'item', $itemId);

    $ins = db()->prepare(
        'INSERT INTO user_items (user_id, item_id) VALUES (:u, :i)'
    );
    $ins->execute([':u' => $uid, ':i' => $itemId]);

    db()->commit();
} catch (RuntimeException $e) {
    if (db()->inTransaction()) db()->rollBack();
    if ($e->getMessage() === 'coins_insufficient') {
        json_error('코인이 부족해요.', 402);
    }
    throw $e;
} catch (Throwable $e) {
    if (db()->inTransaction()) db()->rollBack();
    throw $e;
}

$user = load_user_by_id($uid);
json_ok([
    'item'  => [
        'id'     => (int)$item['id'],
        'slug'   => $item['slug'],
        'name'   => $item['name'],
        'slot'   => $item['slot'],
        'price'  => $price,
        'rarity' => $item['rarity'],
    ],
    'coins' => (int)$user['coins'],
    'owned' => array_map('intval', array_keys(user_owned_items($uid))),
]);
