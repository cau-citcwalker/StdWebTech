# FinEdu — 금융·경제 학습 플랫폼

> 주식, 자산 관리 등 금융·경제를 게이미피케이션 방식으로 배우는 학습 플랫폼.
> ___ 스타일의 UX와 마스코트 캐릭터, 단계별 레슨으로 금융 리터러시를 키웁니다.

## 기술 스택

- **Frontend**: 순수 HTML / CSS / JavaScript (프레임워크 없음)
- **Backend**: PHP (InfinityFree 호환)
- **DB**: MySQL (InfinityFree 제공)
- **Hosting**: InfinityFree

## 시작 출처

이 프로젝트의 메인 페이지 메뉴바와 일부 베이스 스타일은
[BootstrapMade 템플릿 14번 — FlexStart](https://bootstrapmade.com/flexstart-bootstrap-startup-template/)
에서 영감을 얻어 다시 만들었습니다. 템플릿의 원본 파일은 모두 제거하고,
구조와 네비게이션 패턴만 참고했습니다.

## 진행 상황

자세한 제작 과정은 각 PR과 아래 “제작 일지” 섹션을 참고하세요.

## 폴더 구조

```
.
├── api/                  PHP 백엔드 (InfinityFree 호환)
│   ├── _init/
│   │   └── schema.sql    InfinityFree phpMyAdmin 에 넣을 DB 스키마
│   ├── _lib/
│   │   ├── bootstrap.php 모든 엔드포인트의 첫 require
│   │   ├── db.php        싱글톤 PDO
│   │   └── response.php  JSON 응답 헬퍼
│   ├── auth/             로그인 · 회원가입 · 로그아웃 (예정)
│   ├── lessons/          레슨 목록 · 제출 (예정)
│   ├── progress/         학습 진행도 (예정)
│   ├── config.example.php  DB 설정 템플릿 (커밋됨)
│   ├── config.php        실제 DB 설정 (.gitignore — 커밋되지 않음)
│   └── ping.php          /api/ping.php — 서버 + DB 헬스 체크
├── assets/
│   ├── css/
│   │   ├── base.css       디자인 토큰 · 리셋 · 타이포
│   │   └── components.css 버튼 · 카드 · 입력 · 헤더 · 토스트
│   ├── js/
│   │   ├── api.js         JSON fetch 래퍼
│   │   └── site.js        헤더 스크롤 · 모바일 네비 · 토스트
│   └── img/
├── .htaccess              URL 깔끔화 + 정적 캐싱 + 설정 파일 차단
├── .gitignore
└── README.md
```

## 배포

InfinityFree 의 `htdocs/` 에 저장소 내용을 그대로 업로드한다.

1. `api/config.example.php` 를 참고해 `api/config.php` 를 만들어 서버에 올린다
   (자격 증명이 포함되므로 git 에 커밋되지 않음).
2. cPanel → phpMyAdmin 에서 `api/_init/schema.sql` 을 실행한다.
3. 브라우저에서 `https://<도메인>/api/ping.php` 가 `{"data":{"db":"up"}}` 를 돌려주면
   백엔드는 정상.

## 제작 일지

> 각 PR이 머지될 때마다 이 섹션이 갱신됩니다.

### 0. 저장소 초기화 (main 첫 커밋)

- `main` 트렁크 생성 (.gitignore, README)
- 이후 모든 변경 사항은 feature 브랜치 → PR → squash merge (TBD)

### 1. 프로젝트 scaffolding (`chore/scaffold` → PR)

- 폴더 구조 결정: `api/` (백엔드), `assets/css|js|img/` (프론트), `.htaccess`
- 디자인 토큰 정리 (`base.css`)
  - Pretendard 글꼴, 4px 간격 스케일, 듀오링고 영감 컬러 (브랜드 그린 #58cc02 + 보조)
  - `prefers-reduced-motion` 대응
- 재사용 컴포넌트 (`components.css`)
  - 듀오링고 “푸시 버튼” (아래쪽 그림자 → active 시 짓눌리는 효과)
  - 입력 / 카드 / 진행바 / 뱃지 / 헤더 / 푸터 / 토스트
- 프론트 헬퍼
  - `api.js` — fetch 래퍼 (JSON, 세션 쿠키)
  - `site.js` — 헤더 그림자 · 모바일 네비 · `window.toast` · `data-anim` 진입 애니메이션
- PHP 백엔드 기반
  - `bootstrap.php` 가 설정 로드 / 세션 시작 / JSON 헤더 / 공용 헬퍼 require
  - `db.php` 싱글톤 PDO, `response.php` JSON 응답 / 메서드 가드 / 세션 헬퍼
  - `ping.php` 헬스 체크
- DB 스키마 (`api/_init/schema.sql`)
  - `users` · `units` · `lessons` · `questions` · `user_lesson_progress`

### 2. 메인 페이지 + 마스코트 (`feat/home` → PR)

- 마스코트 캐릭터 “**도토리**” (다람쥐) 디자인
  - 순수 SVG 로 그림. 그라데이션 털, 큰 눈, 분홍 볼터치, 도토리 들고 있는 손
  - 인라인 SVG 라서 눈동자가 마우스를 따라 움직임 (`home.js`)
  - 부드러운 상하 bobbing 애니메이션 (CSS keyframes)
  - 사본은 `assets/img/mascot-dotori.svg` 로도 단독 보존
- Hero 섹션
  - 헤드라인에 그라데이션 텍스트, 듀오링고 “푸시 버튼” CTA
  - 마스코트 주변에 떠다니는 칩 (`+12.4% / 코인 +5 / 환율 안정 / XP +20`) 으로
    “주식 = 게임” 분위기
  - 학습자 수 trust 뱃지
- Features (3 카드) — 짧은 레슨 · 매일 습관 · 게이미피케이션
- How-it-works (3 단계) — 점선으로 연결된 1→2→3 진행
- Stats — 카운트업 애니메이션 (IntersectionObserver, 이징 적용)
- Final CTA — 그린 그라데이션 박스
- Footer — 템플릿 14번 영감 attribution
- 진입 애니메이션 — `data-anim` 요소가 뷰포트에 들어올 때 페이드/슬라이드
- 그리드 디버깅: `1.05fr 1fr` 가 stage 컬럼 폭을 못 잡아서 SVG 가 0×0
  으로 렌더되던 이슈는 `minmax(0, …fr)` + `width: 100%` 로 해결
