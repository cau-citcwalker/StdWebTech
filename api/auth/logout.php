<?php
/**
 * POST /api/auth/logout.php
 *   세션을 파기한다. 로그인 상태가 아니더라도 멱등.
 */

require __DIR__ . '/../_lib/bootstrap.php';
require __DIR__ . '/../_lib/auth.php';

require_method('POST');

logout_user();
json_ok(['ok' => true]);
