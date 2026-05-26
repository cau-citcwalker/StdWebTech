<?php
/**
 * FinEdu — 리그/티어 헬퍼
 *
 * 누적 XP 기반 6 단계 티어. 주간 XP 는 user_lesson_progress 의 이번 주 SUM.
 */

declare(strict_types=1);

const LEAGUE_TIERS = [
    ['key' => 'bronze',   'name' => '브론즈',  'min' => 0,     'color' => '#b08570'],
    ['key' => 'silver',   'name' => '실버',    'min' => 100,   'color' => '#9aa3ad'],
    ['key' => 'gold',     'name' => '골드',    'min' => 500,   'color' => '#ffc800'],
    ['key' => 'sapphire', 'name' => '사파이어','min' => 2000,  'color' => '#1cb0f6'],
    ['key' => 'ruby',     'name' => '루비',    'min' => 5000,  'color' => '#ff4b4b'],
    ['key' => 'diamond',  'name' => '다이아',  'min' => 10000, 'color' => '#ce82ff'],
];

function tier_for_xp(int $xp): array
{
    $current = LEAGUE_TIERS[0];
    foreach (LEAGUE_TIERS as $t) {
        if ($xp >= $t['min']) $current = $t;
    }
    return $current;
}

function next_tier(array $current): ?array
{
    $idx = array_search($current['key'], array_column(LEAGUE_TIERS, 'key'));
    if ($idx === false || $idx === count(LEAGUE_TIERS) - 1) return null;
    return LEAGUE_TIERS[$idx + 1];
}

/**
 * 이번 주(월~일) 시작일을 YYYY-MM-DD 로 반환.
 */
function week_start_date(): string
{
    // PHP 의 N: 1(월) ~ 7(일). 월요일을 주의 시작으로.
    $weekday = (int)date('N');
    return date('Y-m-d', strtotime('-' . ($weekday - 1) . ' days'));
}
