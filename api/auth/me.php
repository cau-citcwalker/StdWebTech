<?php
/**
 * GET /api/auth/me.php
 *   현재 세션 사용자를 돌려준다.
 *   비로그인: 200 { data: { user: null } }
 *   로그인:   200 { data: { user: { ... } } }
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('GET');

$user = load_current_user();
json_ok(['user' => $user ? public_user($user) : null]);
