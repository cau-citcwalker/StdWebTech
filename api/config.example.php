<?php
/**
 * FinEdu — DB / 환경 설정 템플릿
 *
 * 이 파일을 `config.php` 로 복사한 뒤 실제 값으로 채운다.
 * `config.php` 는 .gitignore 되어 있으므로 절대 커밋되지 않는다.
 *
 *  cp api/config.example.php api/config.php
 *  # 그리고 아래 값들을 수정
 */

return [
    'db' => [
        'host'     => 'sql301.infinityfree.com',
        'name'     => 'if0_41279101_finedu',
        'user'     => 'if0_41279101',
        'password' => '',           // <- 실제 비밀번호로 채울 것
        'charset'  => 'utf8mb4',
    ],

    // 세션 쿠키 옵션
    'session' => [
        'name'     => 'finedu_session',
        'lifetime' => 60 * 60 * 24 * 30,   // 30 일
        'secure'   => false,               // HTTPS 사용 시 true 로
        'samesite' => 'Lax',
    ],

    // 회원가입 시 사용할 패스워드 해시 옵션
    'password' => [
        'algo' => PASSWORD_BCRYPT,
        'cost' => 11,
    ],

    // 디버그 (개발 환경에서만 true)
    'debug' => false,
];
