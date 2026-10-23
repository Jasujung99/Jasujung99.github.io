# 도메인 변경 검증 기록

점검일: 2026-10-23 (Asia/Seoul). 운영 전환은 아직 적용하지 않았다. 설정·전환 순서·롤백은 [운영 안내](domain-migration.md)를 따른다.

## 시작 상태와 환경

- 최초 작업 폴더: 커밋·원격·미커밋 소스 변경이 없는 `master` 저장소. 기존 폴더는 보존하고 `haeum-domain-migration` 하위에 대상 저장소만 복제했다.
- 대상: `Jasujung99/Jasujung99.github.io`, 기준 main 커밋 `c2e4d2c82e3a111fd98312088fc06a97605e7e0b`. 작업 브랜치: `codex/haeum-custom-domain`.
- 복제 직후 `samples/worker/desktop.ini`가 일시적으로 untracked로 나타났다. 삭제·덮어쓰기·커밋하지 않았으며 이후 상태 확인에서는 나타나지 않았다.
- 적용할 `AGENTS.md`는 상위 경로와 저장소에서 발견되지 않았다. README, package.json, lockfile, 두 workflow, Vite 설정, 두 CNAME을 확인했다.
- 기본 실행 환경: Windows, Git 2.53.0, Node.js 24.19.0. npm과 GitHub CLI는 PATH에 없었다. 공식 배포본의 SHA256을 확인하고 작업 폴더에만 Node.js 20.20.2 / npm 10.8.2를 준비했다.
- CI는 `ubuntu-latest` / Node.js 20이며 세부 패치 버전·운영체제는 로컬과 다를 수 있다. Windows 샌드박스의 Node 경로 접근 오류(EPERM)는 허용된 외부 실행으로 해결했다. 소스 오류로 분류하지 않았다.
- 연결된 GitHub 계정은 대상 저장소 admin 권한을 반환했다. 현재 연결 도구는 Pages 설정 조회를 지원하지 않고 공개 API 조회도 404여서, 실제 Custom domain·Enforce HTTPS·계정 도메인 검증 상태는 관리자 화면에서 확인해야 한다.

## 빌드와 코드 점검

- 원본 상태에서 `npm ci --no-audit --no-fund`: 224개 패키지 설치 성공. lockfile 변경 없음.
- 수정 전 `npm run build`: 성공 (`tsc --noEmit && vite build`, Vite 5.4.21).
- 주소 수정 후 빌드 및 추가 Worker 수정 후 최종 `npm run build`: 성공. 기존 브라우저 호환성 데이터 노후 경고만 동일하게 발생했다. 의존성은 업그레이드하지 않았다.
- `node --test samples/worker/cors.test.mjs`: 19개 테스트 / 5개 suite 모두 통과. 실제 세 Worker handler에서 기존·새 출처의 OPTIONS 및 로컬 응답, 공백이 있는 목록, 단일 출처, 허용되지 않은 호스트·프로토콜·포트, answer Worker의 미설정·와일드카드 거절을 확인했다. 외부 fetch는 테스트에서 차단하며 AI는 mock, 구독은 로컬 입력 검증 응답만 사용한다.
- 두 CNAME과 빌드 결과 `dist/CNAME`은 `haeum.haeonkorean.com`. 홈페이지 소개·답변용 facts는 새 주소다.
- `haeumkorean.me` 잔여 참조는 전환 기간 Worker의 old+new 허용 목록, 회귀 테스트, 운영·롤백 기록에만 의도적으로 남겼다. 과거 블로그·원문·외부 채널은 치환하지 않았다.
- canonical, Open Graph URL, sitemap, robots.txt, 자체 공유 URL 기능은 현재 소스에 없다. 새로 추가하지 않았다.
- Vite base는 기본 `/`, 루트 자산·KB 경로 및 API endpoint URL은 유지했다. `package.json`, lockfile, Vite 설정, 배포·KB 동기화 workflow는 변경하지 않았다.
- `git diff --check` 통과. 검토 범위는 대표 주소·Worker 샘플 CORS·회귀 테스트·관련 문서다.

## 로컬 브라우저

빌드한 `dist`를 `http://127.0.0.1:4173/`에서 확인했다. 홈 화면, 초기 안내 닫기, 교육·시험 상세 메뉴 이동과 해시 경로 새로고침이 정상 표시된다. 네이버 톡톡·Place·블로그·전화 링크의 목적지는 기존 값으로 유지했다. 외부 예약·문의 서비스 내부 동작이나 실제 제출은 검증하지 않았다.

상담 신청 API는 원래 기본값이 미설정(`null`)이며 로컬 상세 화면에서 비활성 안내가 표시된다. 이번 주소 변경으로 발생한 오류가 아니다. 운영 구독·답변 POST, 새 도메인에서의 브라우저 API 동작, 모바일 실기기는 미검증이다.

## 운영 API 사전 요청

2026-10-23 18:29 KST, `https://sweet-bird-16a2.jasujung404.workers.dev`에 `Access-Control-Request-Method: POST`, `Access-Control-Request-Headers: content-type`과 각 Origin을 담아 OPTIONS만 요청했다.

| API 경로 | 요청 Origin | HTTP | Access-Control-Allow-Origin | 판정 |
| --- | --- | --- | --- | --- |
| `/api/answer` | `https://haeumkorean.me` | 204 | `https://haeumkorean.me` | 기존 출처 허용 |
| `/api/answer` | `https://haeum.haeonkorean.com` | 204 | `https://haeumkorean.me` | 새 출처 불허 |
| `/api/subscribe` | `https://haeumkorean.me` | 204 | `https://haeumkorean.me` | 기존 출처 허용 |
| `/api/subscribe` | `https://haeum.haeonkorean.com` | 204 | `https://haeumkorean.me` | 새 출처 불허 |

응답만으로 운영 Worker가 어느 샘플과 같은 구현인지 확정할 수 없다. 두 경로가 같은 호스트를 사용한다는 사실도 소스 일치를 입증하지 않는다. Cloudflare 운영 코드·환경변수·활성 버전과 새 출처 허용은 별도 확인·변경이 필요하다. 샘플 수정과 로컬 테스트 성공을 운영 적용 성공으로 보고하지 않는다.

## 운영 미완료 항목

- 18:30 KST 읽기 전용 HTTPS HEAD에서 기존 `.me`는 GitHub.com HTTP 200, 해온 본사이트 `@`·`www`는 Hostinger HTTP 200을 확인했다. DNS 변경 전 값은 운영 안내에 기록했다. 이 응답은 전체 기능 검증을 뜻하지 않는다.
- 새 `haeum.haeonkorean.com`은 공개 DNS에서 이름이 없는 상태였다. 실제 DNS 관리업체·충돌 레코드는 로그인한 관리 화면에서도 확인해야 한다.
- Pages Custom domain 변경, 계정 도메인 소유권 검증, DNS CNAME 추가, 인증서 발급·Enforce HTTPS, 운영 Worker old+new 허용, 전환 후 기능·기존 주소 리디렉션은 아직 적용·검증하지 않았다.
- main 병합·운영 배포를 실행하지 않았다. 해온 본사이트의 코드·배포, `@`·`www`·메일·NS·등록기관·보안 설정은 변경하지 않았다.
