<?php
/**
 * GET /api/scraps/list.php
 *   응답: {
 *     data: {
 *       lessons: [ {scraped_at, id, slug, title, summary, unit_slug, unit_title} ],
 *       terms:   [ {scraped_at, term_slug} ]    // 용어 메타는 클라이언트가 terms.json 으로 hydrate
 *     }
 *   }
 *
 *   sort: 최근 저장 순.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('GET');
$uid = require_login();

// lessons: join 으로 title / unit 까지 함께 가져옴
$lessons = db()->prepare(
    "SELECT s.scraped_at, l.id, l.slug, l.title, l.summary,
            u.slug AS unit_slug, u.title AS unit_title
     FROM user_scraps s
     JOIN lessons l ON l.id = CAST(s.target_key AS UNSIGNED)
     JOIN units u   ON u.id = l.unit_id
     WHERE s.user_id = :u AND s.target_type = 'lesson'
     ORDER BY s.scraped_at DESC"
);
$lessons->execute([':u' => $uid]);
$lessonsList = array_map(function($r){
    return [
        'scraped_at' => $r['scraped_at'],
        'id'         => (int)$r['id'],
        'slug'       => $r['slug'],
        'title'      => $r['title'],
        'summary'    => $r['summary'],
        'unit_slug'  => $r['unit_slug'],
        'unit_title' => $r['unit_title'],
    ];
}, $lessons->fetchAll());

// terms: slug 만 (메타는 frontend 에서 terms.json hydrate)
$terms = db()->prepare(
    "SELECT scraped_at, target_key AS term_slug
     FROM user_scraps
     WHERE user_id = :u AND target_type = 'term'
     ORDER BY scraped_at DESC"
);
$terms->execute([':u' => $uid]);
$termsList = $terms->fetchAll();

json_ok([
    'lessons' => $lessonsList,
    'terms'   => $termsList,
]);
