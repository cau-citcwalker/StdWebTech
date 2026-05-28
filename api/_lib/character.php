<?php
/**
 * FinEdu — 캐릭터 / 아이템 헬퍼
 *
 *   list_items()                       : 카탈로그 (전체 아이템)
 *   user_owned_items($uid)             : [item_id => true]
 *   user_equipment($uid)               : [slot => item_id]
 *   ensure_starter_items($uid)         : starter 아이템 자동 지급 (멱등)
 *   equip_item($uid, $slot, $itemId|null)
 */

declare(strict_types=1);

const ITEM_SLOTS = ['hair', 'face', 'top', 'bottom', 'shoes', 'accessory'];

function list_items(): array
{
    $rows = db()->query(
        'SELECT id, slug, name, description, slot, price, rarity, sort_order
         FROM items
         ORDER BY slot, sort_order, id'
    )->fetchAll();
    foreach ($rows as &$r) {
        $r['id']    = (int)$r['id'];
        $r['price'] = (int)$r['price'];
        $r['sort_order'] = (int)$r['sort_order'];
    }
    return $rows;
}

function user_owned_items(int $userId): array
{
    $stmt = db()->prepare(
        'SELECT item_id FROM user_items WHERE user_id = :u'
    );
    $stmt->execute([':u' => $userId]);
    $owned = [];
    foreach ($stmt->fetchAll() as $r) $owned[(int)$r['item_id']] = true;
    return $owned;
}

function user_equipment(int $userId): array
{
    $stmt = db()->prepare(
        'SELECT slot, item_id FROM user_equipment WHERE user_id = :u'
    );
    $stmt->execute([':u' => $userId]);
    $eq = [];
    foreach ($stmt->fetchAll() as $r) $eq[$r['slot']] = (int)$r['item_id'];
    return $eq;
}

function ensure_starter_items(int $userId): void
{
    // 1) 인벤토리에 starter 전부 추가 (이미 있으면 IGNORE)
    db()->prepare(
        "INSERT IGNORE INTO user_items (user_id, item_id)
         SELECT :u, id FROM items WHERE rarity = 'starter'"
    )->execute([':u' => $userId]);

    // 2) 각 슬롯에 아직 아무것도 장착돼있지 않으면, 그 슬롯의 starter 첫 번째를 자동 장착.
    //    sort_order = 0 은 "비어있는" 시드 (예: hair-bald) 라서 제외 — 처음부터 옷 입은 상태로.
    foreach (ITEM_SLOTS as $slot) {
        $hasEq = db()->prepare(
            "SELECT 1 FROM user_equipment WHERE user_id = :u AND slot = :s LIMIT 1"
        );
        $hasEq->execute([':u' => $userId, ':s' => $slot]);
        if ($hasEq->fetchColumn() !== false) continue;

        $pick = db()->prepare(
            "SELECT id FROM items
             WHERE rarity = 'starter' AND slot = :s AND sort_order > 0
             ORDER BY sort_order ASC, id ASC
             LIMIT 1"
        );
        $pick->execute([':s' => $slot]);
        $itemId = $pick->fetchColumn();
        if ($itemId) {
            db()->prepare(
                "INSERT IGNORE INTO user_equipment (user_id, slot, item_id)
                 VALUES (:u, :s, :i)"
            )->execute([':u' => $userId, ':s' => $slot, ':i' => (int)$itemId]);
        }
    }
}

function equip_item(int $userId, string $slot, ?int $itemId): void
{
    if (!in_array($slot, ITEM_SLOTS, true)) {
        json_error('알 수 없는 슬롯이에요.', 422);
    }

    if ($itemId === null) {
        db()->prepare('DELETE FROM user_equipment WHERE user_id = :u AND slot = :s')
            ->execute([':u' => $userId, ':s' => $slot]);
        return;
    }

    // 아이템 존재 + 슬롯 일치 + 사용자가 보유 중인지 확인
    $stmt = db()->prepare(
        'SELECT i.id, i.slot
         FROM items i
         WHERE i.id = :id LIMIT 1'
    );
    $stmt->execute([':id' => $itemId]);
    $item = $stmt->fetch();
    if ($item === false)   json_error('아이템을 찾을 수 없어요.', 404);
    if ($item['slot'] !== $slot) json_error('아이템이 이 슬롯에 맞지 않아요.', 422);

    $own = db()->prepare(
        'SELECT 1 FROM user_items WHERE user_id = :u AND item_id = :i LIMIT 1'
    );
    $own->execute([':u' => $userId, ':i' => $itemId]);
    if ($own->fetchColumn() === false) {
        json_error('보유하지 않은 아이템이에요.', 403);
    }

    db()->prepare(
        'REPLACE INTO user_equipment (user_id, slot, item_id) VALUES (:u, :s, :i)'
    )->execute([':u' => $userId, ':s' => $slot, ':i' => $itemId]);
}
