<?php
/**
 * FinEdu — 알림 헬퍼
 *
 *   notify($userId, $type, $title, $body=null, $link=null)
 *   list_notifications($userId, $limit = 30, $onlyUnread = false)
 *   mark_notification_read($userId, $id|null)   // id=null 이면 전부
 *   unread_count($userId)
 */

declare(strict_types=1);

function notify(int $userId, string $type, string $title, ?string $body = null, ?string $link = null): int
{
    $stmt = db()->prepare(
        'INSERT INTO notifications (user_id, type, title, body, link)
         VALUES (:u, :t, :ti, :b, :l)'
    );
    $stmt->execute([
        ':u' => $userId, ':t' => $type, ':ti' => $title,
        ':b' => $body, ':l' => $link,
    ]);
    return (int)db()->lastInsertId();
}

function list_notifications(int $userId, int $limit = 30, bool $onlyUnread = false): array
{
    $sql = 'SELECT id, type, title, body, link, is_read, created_at
            FROM notifications WHERE user_id = :u';
    if ($onlyUnread) $sql .= ' AND is_read = 0';
    $sql .= ' ORDER BY created_at DESC LIMIT ' . (int)$limit;
    $stmt = db()->prepare($sql);
    $stmt->execute([':u' => $userId]);
    return array_map(function ($r) {
        return [
            'id'         => (int)$r['id'],
            'type'       => $r['type'],
            'title'      => $r['title'],
            'body'       => $r['body'],
            'link'       => $r['link'],
            'is_read'    => (bool)(int)$r['is_read'],
            'created_at' => $r['created_at'],
        ];
    }, $stmt->fetchAll());
}

function mark_notification_read(int $userId, ?int $id = null): void
{
    if ($id === null) {
        db()->prepare(
            'UPDATE notifications SET is_read = 1, read_at = NOW()
             WHERE user_id = :u AND is_read = 0'
        )->execute([':u' => $userId]);
    } else {
        db()->prepare(
            'UPDATE notifications SET is_read = 1, read_at = NOW()
             WHERE id = :id AND user_id = :u'
        )->execute([':id' => $id, ':u' => $userId]);
    }
}

function unread_count(int $userId): int
{
    $stmt = db()->prepare(
        'SELECT COUNT(*) FROM notifications WHERE user_id = :u AND is_read = 0'
    );
    $stmt->execute([':u' => $userId]);
    return (int)$stmt->fetchColumn();
}
