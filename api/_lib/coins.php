<?php
/**
 * FinEdu — 코인 헬퍼
 *
 *   award_coins($userId, $delta, $reason, ?$refType=null, ?$refId=null): int
 *     - users.coins 갱신
 *     - coin_ledger 1 줄 추가
 *     - 새 잔액 반환
 *     - $delta < 0 일 때 잔액이 음수가 되지 않도록 보호
 */

declare(strict_types=1);

function award_coins(int $userId, int $delta, string $reason, ?string $refType = null, ?int $refId = null): int
{
    if ($delta === 0) {
        // 0 변동은 무시
        $row = db()->prepare('SELECT coins FROM users WHERE id = :id LIMIT 1');
        $row->execute([':id' => $userId]);
        return (int)$row->fetchColumn();
    }

    // 호출자가 이미 트랜잭션을 열어둔 경우엔 중첩 begin/commit 안 함
    // (PDO 는 중첩 beginTransaction 에서 예외를 던지므로 buy.php 같은
    // 호출 경로에서 구매가 실패하던 문제 수정.)
    $owns = !db()->inTransaction();
    if ($owns) db()->beginTransaction();
    try {
        $stmt = db()->prepare('SELECT coins FROM users WHERE id = :id FOR UPDATE');
        $stmt->execute([':id' => $userId]);
        $current = (int)$stmt->fetchColumn();
        $next = $current + $delta;
        if ($next < 0) {
            if ($owns) db()->rollBack();
            throw new RuntimeException('coins_insufficient');
        }

        db()->prepare('UPDATE users SET coins = :c WHERE id = :id')
            ->execute([':c' => $next, ':id' => $userId]);

        db()->prepare(
            'INSERT INTO coin_ledger (user_id, delta, reason, ref_type, ref_id, balance_after)
             VALUES (:u, :d, :r, :rt, :ri, :b)'
        )->execute([
            ':u' => $userId,
            ':d' => $delta,
            ':r' => $reason,
            ':rt' => $refType,
            ':ri' => $refId,
            ':b' => $next,
        ]);

        if ($owns) db()->commit();
        return $next;
    } catch (Throwable $e) {
        if ($owns && db()->inTransaction()) db()->rollBack();
        throw $e;
    }
}
