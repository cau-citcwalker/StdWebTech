# FinEdu

경제·금융을 게임처럼 배우는 학습 웹사이트.
하루 5분, 단원·레슨·문제로 풀어가는 한국어 학습 플랫폼.

## 스택

- HTML / CSS / 바닐라 JavaScript (ES 모듈, 프레임워크 없음)
- PHP 8 (PDO + MySQL)
- InfinityFree 무료 호스팅에서 동작하도록 의존성 없이 작성

## 폴더 구조

```
.
├── *.html                    21개 페이지 (메인/학습/옷장/마켓/친구/리그/프로필 등)
├── api/
│   ├── _init/                schema.sql · seed.sql · seed_avatar.sql
│   ├── _lib/                 bootstrap / auth / db / response / character / coins / league / friends / notify
│   ├── auth/                 signup · login · logout · me
│   ├── account/              username · email · password · 회원 탈퇴
│   ├── learn/                map · lesson · grade · submit
│   ├── character/            state · equip
│   ├── market/               buy
│   ├── me/                   overview
│   ├── friends/              list · request · accept · decline · remove · profile
│   ├── league/               leaderboard
│   ├── calendar/             month · event_create · event_update · event_delete · friends_month
│   ├── qna/                  list · create · get · update · delete · reply · reply_update · reply_delete
│   ├── reviews/              list · create · update · delete · like_toggle
│   ├── scraps/               toggle · list
│   ├── install.php           원샷 설치 (?force=1&confirm=RESET 으로 재설치)
│   ├── ping.php              헬스 체크
│   └── config.example.php    실 자격증명은 config.php (gitignore)
├── assets/
│   ├── css/                  base · components + 페이지별
│   ├── js/                   api · site · 페이지별 모듈
│   └── img/                  파비콘 · character-base.png · items/combos/
├── .htaccess                 URL rewrite + 정적 캐싱 + config.php 차단
└── README.md
```

## 페이지

| 공개 | 로그인 필요 |
|---|---|
| `/` 메인 · `about` · `how-it-works` · `faq` · `terms` 용어사전 · `qna` Q&A · `reviews` 리뷰 · `login` · `signup` | `learn` 학습 · `lesson` 풀이 · `closet` 옷장 · `market` 마켓 · `friends` / `friend` · `league` · `profile` · `calendar` · `scraps` · `settings` |

헤더 nav 는 로그인 상태에 따라 자동 숨김 (`<html data-auth="no">` + CSS).
다크/라이트 + auth 상태는 `localStorage` + `storage`/`pageshow` 이벤트로 탭 간 동기화.

## 캐릭터

`hair`, `top`, `bottom` 세 슬롯, 각 3 종. 마켓에서 코인으로 구매.
렌더는 미리 합성된 PNG 1 장: `assets/img/items/combos/hair{H}+top{T}+pants{P}.png`.
부분 장착은 페어 PNG (`hair1+top1.png` / `hair1+pants1.png`) 로 폴백,
hair 만 또는 미장착이면 `character-base.png`.

## 게임 메커닉

- **XP**: 첫 통과 정해진 양 + 재도전은 절반
- **코인**: 첫 통과 10, 재도전 3, 스트릭 7 배수 보너스 50
- **스트릭**: 하루 1 레슨 = 연속 일수 카운트 (어제 +1, 오늘 유지, 그 외 리셋)
- **리그**: 누적 XP 기준 6 단계 티어 (브론즈 → 다이아). 이번 주 / 명예의 전당 두 탭

## 학습 콘텐츠

`api/_init/seed.sql` 에 단원 4 + 레슨 10 + 문제 ~20.
용어사전은 동일 시드에서 30 종 (경제 / 시장 / 기초 / 거시 / 자산 / 세금 카테고리).

## 배포

InfinityFree `htdocs/` 에 저장소 전체를 올린다. `.git`, `ppt.md` 같은 운영에
필요 없는 파일은 제외.

1. **config**: `api/config.example.php` 를 참고해 `api/config.php` 생성. 자격증명은
   서버에만 둔다 (gitignore 되어 있음).
2. **설치**: `https://<도메인>/api/install.php` 한 번 접속. schema → seed → seed_avatar
   순서로 실행. 재설치는 `?force=1&confirm=RESET`. 끝나면 **install.php 는 반드시
   삭제**.
3. **확인**: `/api/ping.php` 가 `{"data":{"db":"up", ...}}` 를 돌려주면 OK.

수동 설치 (phpMyAdmin Import) 도 가능 — `_init/` 의 SQL 3 개를 순서대로 import.

## 로컬에서 보기

이 저장소에 PHP/DB 구동 환경이 따로 없으면, 정적 페이지만 보려면 그냥
브라우저로 HTML 을 열어도 된다. 다만 인증·학습·DB 가 필요한 페이지는 로컬
PHP + MySQL 또는 InfinityFree 에서 동작한다.

## 라이선스

코드는 학습용 개인 프로젝트.
