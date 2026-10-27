# 도메인 변경 검증 기록

**2026-10-27 최종 범위·승인:** PR #5로 갱신된 main `486e8922`를 PR #4 브랜치에 반영한다. 공지 디자인은 보존하고 표시 주소·href의 누락된 `n`을 수정한다. 온라인 학습은 사용자가 지정한 **개발 중** 화면을 유지하며 어휘 버튼을 복구하지 않는다. 기존 앵커 보완·주소 설정·Worker 샘플 검증은 유지한다. 사용자는 이 최종 범위의 재검증 → PR #4 병합 → 기존 Actions 배포 → 운영 점검을 승인했다. 아래 10월 23~26일 결과는 당시 코드·운영 상태의 기록이며 최종 병합·배포의 성공은 PR #4와 해당 Actions 결과를 기준으로 별도 확인한다.

10월 27일 병합 전 재점검에서 새 해움·어휘·기존 pages.dev·해온 본사이트·`.me` 안내의 HTTPS, 해움 HTTP→HTTPS, Worker 네 OPTIONS, 기존 DNS 값 보존을 확인했다. `.me`는 이제 HTTPS 200 안내 페이지이며 새 주소 버튼이 정확하다. 자동 리디렉션은 없고 옛 `.me/kb/...`는 404다. 별도 해온 저장소의 백업 폴더는 읽기 전용으로만 확인했으며 이 저장소에 디자인 백업 체계를 도입하지 않는다.

## 10월 27일 최종 병합 전 검증

- 최신 main `486e8922`의 공지 디자인·개발 중 블록을 보존했다. 공지의 표시 주소와 href 두 곳만 `haeum.haeonkorean.com`으로 수정했다. 어휘 시작 링크는 0개이며, 기존 네 section ID·href와 앵커 초기 진입 effect는 유지한다.
- Node.js 20.20.2 / npm 10.8.2에서 `npm run build` 통과. 이전과 같은 브라우저 데이터 노후 경고만 발생했다. 생성 JS `/assets/index-CQkvQKZ7.js`, CSS `/assets/index-QVPM46Me.css`; workflow·Vite base·의존성은 변경하지 않았다.
- Worker 회귀 테스트 19개 / 5 suite 모두 통과. 외부 fetch·실제 데이터 쓰기는 수행하지 않았다.
- URL inventory 검증 통과: public 41개 보존, manifest 24문서·KB 이미지 6개, 로컬 HTTP 43개 200·파일 내용 일치. 실제 `docsearch.ts`의 25 GET 모두 200, 24문서 인덱스·TOPIK 검색 결과 4개.
- 로컬 브라우저에서 홈·로아·loading 별칭·교육 화면과 세 hash 경로의 Ctrl+R 유지 확인. 네 앵커 새 탭 직접 진입 시 about/programs/online-learning의 위쪽 좌표 0px, contact는 문서 끝의 스크롤 한계에서 158~559px로 화면 안에 표시됐다. 깨진 이미지·콘솔 오류 없음. 공지 href 정확, 온라인 학습 개발 중·어휘 링크 없음 확인.
- 코드 리뷰와 도메인·충돌 마커 검색, `git diff --check`를 통과했다. 기존 `.me` 표시 문자열과 Worker old Origin·테스트·날짜별 이력만 의도적으로 유지한다. 실제 AI 답변·구독 POST, 어휘 이메일·인쇄 전체 흐름은 미검증이다.
- 이 절은 **최종 로컬 빌드와 병합 전 운영 선행 조건**의 결과다. 승인된 병합·Actions 배포 및 같은 번들의 운영 사후 점검 결과는 PR #4와 해당 Actions 실행에 기록하며 이 로컬 결과로 대체하지 않는다.

점검일: 2026-10-23~26 (Asia/Seoul). 코드 PR은 미병합이다. 10월 26일 어휘 DNS·HTTPS와 사용자 로그인 확인 후 Worker 두 출처 허용, GitHub 계정 도메인 검증·Pages Custom domain·해움 CNAME을 순서대로 적용했다. 새 해움 HTTPS·강제 HTTPS와 기존 main의 URL 검증도 완료했다. PR 최종 번들의 운영 배포·확인은 별도 사용자 승인 병합 이후의 작업이다. 설정·전환 순서·롤백은 [운영 안내](domain-migration.md)를 따른다. 아래 초기 검증, 후속 코드 점검과 날짜별 운영 진행 기록을 구분해 읽는다.

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

이 응답만으로 운영 Worker가 어느 샘플과 같은 구현인지 확정할 수 없다. 두 경로가 같은 호스트를 사용한다는 사실도 소스 일치를 입증하지 않는다. 이 요청 점검 시점에는 Cloudflare 운영 코드·환경변수·활성 버전을 확인하지 못했다. 이후 직접 코드 검사로 확인한 결과는 아래 운영 진행 기록에 따로 적는다. 샘플 수정과 로컬 테스트 성공을 운영 적용 성공으로 보고하지 않는다.

## 초기 운영 미완료 항목 (2026-10-23)

- 18:30 KST 읽기 전용 HTTPS HEAD에서 기존 `.me`는 GitHub.com HTTP 200, 해온 본사이트 `@`·`www`는 Hostinger HTTP 200을 확인했다. DNS 변경 전 값은 운영 안내에 기록했다. 이 응답은 전체 기능 검증을 뜻하지 않는다.
- 새 `haeum.haeonkorean.com`은 공개 DNS에서 이름이 없는 상태였다. 실제 DNS 관리업체·충돌 레코드는 로그인한 관리 화면에서도 확인해야 한다.
- Pages Custom domain 변경, 계정 도메인 소유권 검증, DNS CNAME 추가, 인증서 발급·Enforce HTTPS, 운영 Worker old+new 허용, 전환 후 기능·기존 주소 리디렉션은 아직 적용·검증하지 않았다.
- main 병합·운영 배포를 실행하지 않았다. 해온 본사이트의 코드·배포, `@`·`www`·메일·NS·등록기관·보안 설정은 변경하지 않았다.

## 후속 URL·어휘 도메인 점검 (2026-10-23~24)

PR #4의 기존 변경을 유지한 채 어휘 서비스 링크를 `https://boa-newwords.pages.dev`에서 `https://words.haeonkorean.com`으로 바꾸는 최소 변경과 전체 URL 점검을 추가했다. 기존 Cloudflare Pages 프로젝트 `boa-newwords`와 `pages.dev` 주소는 유지한다. 어휘 프로젝트 호스팅 이전·삭제, 해온 본사이트 변경과 네임서버 이전은 수행하지 않는다.

- 전체 URL 용도 분류, 기존·새 주소 대응표, `public` 파일·KB manifest 전체 목록과 자동 점검 방법: [URL 점검 목록](url-migration-inventory.md).
- 어휘 저장소와 공개 DNS·HTTPS의 읽기 전용 조사, 확인하지 못한 배포 설정·기능: [어휘 도메인 점검](vocabulary-domain-audit.md).
- `words.haeonkorean.com`의 후속 공개 DNS 조회는 NXDOMAIN이었다. 이는 Cloudflare Custom domain이나 HTTPS·학습 기능 준비 완료를 뜻하지 않는다. 실제 DNS 관리 화면의 기존 레코드·Pages 프로젝트 연결·인증서·기능은 별도로 확인해야 한다.
- 기존 해움 route와 앵커, KB 문서 전체군과 자산 경로는 유지한다. 단순 origin 변경 때문에 `/haeum/` base나 path 이동을 추가하지 않는다. `#lead`와 기존 App hash 라우팅의 충돌은 URL 점검 목록에 기존 문제로 기록하며 이번 주소 변경의 범위를 넓혀 수정하지 않는다.
- 10월 24일 최종 `npm run build` 통과. 기존 브라우저 데이터 노후 경고만 발생했다. 생성 JS는 `/assets/index-B4-2D4BW.js`, CSS는 `/assets/index-B1z0D2tN.css`이며 이 해시명 자체는 이후 빌드에서 달라질 수 있다.
- `node --test samples/worker/cors.test.mjs` 재실행: 19개 테스트 / 5개 suite 모두 통과. 실제 운영 POST는 보내지 않았다.
- `node scripts/verify-url-inventory.mjs --base-url http://127.0.0.1:4173` 통과: public 41개 파일의 이름·내용·dist 복사 보존, 43개 실제 HTTP URL의 200 및 내용 일치, manifest 24문서, KB 이미지 6개를 확인했다. HTTP 검사에 `/`·`/index.html`과 현재 생성 JS/CSS를 포함하고, 메타데이터 `/CNAME`·`/assets/.gitkeep`은 dist 복사 검사에 포함하되 방문자 HTTP 필수 항목에서는 제외한다.
- 실제 `docsearch.ts`의 `buildIndex()`와 `search()` 실행: manifest+문서 GET 25건 모두 200, 문서 24개 모두 인덱스에 포함, 24개 section·6,283개 term, `TOPIK` 검색 결과 4개를 확인했다. 브라우저에서 DocBot을 열었을 때도 manifest와 등록 문서 24개가 모두 200으로 로드됐다. AI 답변 생성이나 구독 쓰기 성공을 뜻하지 않는다.
- 최종 빌드를 브라우저에서 직접 열고 새로고침해 `/`, `/#/roa`, `/#/loading`, `/#/education-exam`과 `#about`, `#programs`, `#online-learning`, `#contact`를 각각 확인했다. 네 앵커의 ID·href를 유지하고 실제 섹션 위치로 이동했다. 깨진 이미지와 콘솔 오류는 발견되지 않았으며 어휘 링크의 href는 `https://words.haeonkorean.com`이었다.
- 기존 운영 `.me/#programs`와 수정 전 로컬 빌드에서는 새 탭 직접 진입 시 해당 섹션으로 스크롤하지 않는 기존 문제를 재현했다. 이번에는 네 기존 앵커에 한해 렌더·초기 load 이후와 hashchange에 이동하는 작은 effect를 추가했다. 앵커 ID·앵커 href·라우트·스타일은 바꾸지 않았다. 이 보완은 아직 운영 배포되지 않았다.
- 10월 24일 13:19 KST 읽기 전용 점검에서 기존 `.me`의 public 41개 URL 모두 HTTP 200이고 원본 main 파일의 SHA256과 일치했다. 기존 어휘 `pages.dev`도 HEAD 200이었다. 두 새 도메인은 시스템 HTTPS 요청에서 `ENOTFOUND`로 이름 해석에 실패했고, Node의 별도 DNS 질의는 환경에서 `ECONNREFUSED`여서 그 질의로 현재 레코드 종류를 확정하지 않았다. 앞선 NXDOMAIN 기록과 이번 접속 실패를 구분한다.
- 같은 시각 운영 답변·구독 API의 old/new OPTIONS 네 건은 모두 204였지만, 새 Origin에도 여전히 `Access-Control-Allow-Origin: https://haeumkorean.me`를 반환했다. 운영 CORS 준비 완료로 보고하지 않는다.
- 기존·새 도메인과 `pages.dev` 참조를 재검색했다. `pages.dev`는 소스의 사용자 링크에서 제거되고 호스팅·전환·롤백 설명에만 남는다. root-relative public/KB URL은 그대로다. `git diff --check` 통과, workflow·Vite 설정·의존성 변경 없음.

PR #4는 Draft로 유지한다. 최신 전환 순서는 **Cloudflare Pages에 `words` 등록 → DNS `words` CNAME → 어휘 HTTPS·기능 → Worker old+new origin → GitHub Pages `haeum` 등록 → DNS `haeum` CNAME·HTTPS → 새 해움 모든 경로 점검 → 그 뒤에만 사용자 확인을 받아 PR #4 병합 검토**다. 어느 새 도메인이든 준비가 끝나지 않으면 병합을 보류한다. 위 후속 코드 점검 이후 사용자가 운영 순서 진행을 승인했으며 실제 진행 범위는 다음 절에 구분한다.

병합 전 새 해움 운영 주소에서 확인할 수 있는 것은 기존 main의 배포 산출물이다. 변경안의 새 어휘 링크·facts·앵커 초기 스크롤 보완이 포함된 최종 번들은 로컬에서 먼저 검증하고, 사용자 승인 병합으로 기존 Actions가 배포한 뒤 운영에서 다시 확인해야 한다. 기존 main의 앵커 문제를 최종 수정본의 운영 성공으로 기록하지 않는다. 특히 `words.haeonkorean.com`의 HTTPS·학습 기능 성공은 새 어휘 링크가 main에 배포되기 **전에** 확인해야 한다. 병합 전 점검 결과와 병합 뒤 최종 번들 점검을 혼동하지 않는다.

## 승인 후 운영 진행 기록 (2026-10-24~25)

사용자가 권장 순서대로 운영 진행을 승인한 뒤 Cloudflare 관리 화면에서 확인·실행했다. 다음은 로컬 샘플 테스트 결과가 아닌 실제 관리 화면의 상태다.

- **1단계 등록 요청 완료, 활성화 미완료:** 10월 24일 기존 Cloudflare Pages 프로젝트 `boa-newwords`의 Custom domains에 `words.haeonkorean.com`을 추가하고 외부 DNS 업체의 CNAME 연결 방식을 선택했다. 추가 전에는 연결된 Custom domain이 없었다. 초기 표시는 `Initializing`이었고, 10월 25일 같은 화면 재조회에서 등록은 유지되며 `Inactive` / `Requires DNS setup`임을 확인했다. 기존 production 배포는 유지했으며 새 빌드·배포를 실행하지 않았다. 대시보드의 Git 연결·운영 커밋이 사전 점검한 소스와 일치함을 확인했다.
- **2~3단계 대기:** Hostinger 로그인 후 DNS 영역과 `words` 이름의 기존 값·충돌을 확인해야 한다. 이 기록 시점에는 DNS 변경, 새 주소 HTTPS 인증서·로그인·학습 기능 검증을 완료하지 못했다. Custom domain 등록 요청을 DNS 전환·HTTPS 성공으로 보고하지 않는다.
- **실제 활성 Worker 코드 검사 완료 (10월 24일):** `sweet-bird-16a2` Deployments의 활성 버전 `2ef03df4`가 트래픽 100%를 처리하며 편집기의 같은 Active 버전 소스를 대조했다. 운영 편집기 파일명은 `worker.js`지만 두 API 경로를 모두 처리한다. `/api/answer`와 `/api/subscribe`에 모두 `isAllowedOrigin`이 적용되고, 이 함수와 `corsHeaders`에서 `ALLOWED_ORIGIN.split(',')` 및 `trim()` 후 `new URL(...).origin` 비교로 개별 출처를 판정하며 허용된 요청 Origin 하나를 응답하는 구현을 확인했다. 기존 OPTIONS 결과만으로 쉼표 지원을 추정하지 않았다.
- **운영 환경변수는 아직 기존 값:** Settings → Variables and Secrets에서 Type `Variable`, `ALLOWED_ORIGIN = https://haeumkorean.me`를 확인했다. 값·코드·Worker 배포는 변경하지 않았다. 복수 출처 지원 확인과 새 Origin 운영 허용 완료는 다르다. 어휘 DNS·HTTPS·기능이 준비된 뒤 4단계에서 old+new 값을 적용하고 활성 버전·트래픽 및 두 API × 두 Origin의 OPTIONS를 재검증해야 한다.
- **나머지 운영 단계 미실행:** GitHub Pages Custom domain, `haeum` DNS, PR #4 병합과 main 배포를 실행하지 않았다. 기존 `pages.dev` 주소·어휘 호스팅·해온 본사이트·`@`·`www`·메일·네임서버는 유지했다. 운영 진행 승인과 PR 병합 승인은 별개로 관리한다.

10월 25일 기록 당시 다음 작업은 로그인한 실제 DNS 관리 화면에서 기록·충돌 확인 후 `words` CNAME을 설정하는 것이었다. 이후 진행은 아래와 같다.

## 승인 후 운영 진행 기록 (2026-10-26)

- **DNS 백업·보존:** 실제 Hostinger 관리 화면에서 변경 전 영역 내보내기와 기존 13개 레코드·네임서버 기록을 완료했다. 같은 `words`·`haeum` 이름의 기존 레코드는 없었다. 최종 16개와 비교하여 원래 13개 변경·삭제 0, 추가 3개(`words` CNAME, `haeum` CNAME, GitHub 검증 TXT)를 확인했다. `@`·`www`·메일·네임서버를 변경하지 않았다.
- **어휘 DNS·HTTPS:** `words CNAME → boa-newwords.pages.dev`, 기본 TTL 14400 추가 후 공개 DNS 반영을 확인했다. 초기에는 HTTPS TLS 연결에 실패했으며 이를 성공으로 기록하지 않았다. Cloudflare Check DNS records 실행 후 실제 `Active` / `SSL enabled`로 바뀌었고, 검증을 끄지 않은 HTTPS 홈·`/auth`·`/reset-password` 요청은 모두 200이었다. 기존 `pages.dev`·해온 `@`·`www`도 HTTPS 200이었다.
- **어휘 브라우저·사용자 확인:** 새 주소의 홈·로그인 화면 및 `/auth` 새로고침이 정상 렌더됐고 점검한 브라우저 오류 로그는 없었다. 사용자가 새 주소에서 로그인과 기존 학습 정보가 정상이라고 명시적으로 확인했다. 기존 저장소·배포는 그대로다. 이메일 인증·비밀번호 재설정 메일 전송·인쇄 전체 흐름이나 Supabase 대시보드 설정 자체를 검사한 결과는 아니다.
- **실제 Worker 적용:** 적용 직전 활성 `2ef03df4`가 유지되는지 다시 확인했다. 이 버전의 두 API 쉼표 목록 처리 코드는 10월 24일 직접 검사 완료한 소스다. 런타임 일반 텍스트 `ALLOWED_ORIGIN`만 `https://haeumkorean.me,https://haeum.haeonkorean.com`으로 수정하고 Deploy했다. 새 활성 버전 `e2af83d5`, 배포 메시지 `Updated variable: ALLOWED_ORIGIN`을 확인했다. 소스·기존 Secrets는 변경하지 않았다.

| API | 요청 Origin | HTTP | Access-Control-Allow-Origin |
| --- | --- | --- | --- |
| `/api/answer` | `https://haeumkorean.me` | 204 | `https://haeumkorean.me` |
| `/api/subscribe` | `https://haeumkorean.me` | 204 | `https://haeumkorean.me` |
| `/api/answer` | `https://haeum.haeonkorean.com` | 204 | `https://haeum.haeonkorean.com` |
| `/api/subscribe` | `https://haeum.haeonkorean.com` | 204 | `https://haeum.haeonkorean.com` |

미허용 테스트 Origin `https://cors-audit.invalid`는 두 OPTIONS에서 204와 쉼표 목록 ACAO를 받았다. 이 값은 해당 Origin과 일치하지 않고 유효한 단일 Origin 헤더도 아니므로 브라우저 허용이 아니다. 기존 운영 구현의 비허용 응답 동작을 기록하며 실제 POST는 보내지 않았다. 네 허용 출처 검증과 API 업무 처리 성공을 구분한다.

- **GitHub 계정·Pages:** 계정 수준에는 검증 도메인이 없었다. `haeum.haeonkorean.com`만 추가하고 GitHub 화면이 실제 발급한 TXT 이름·값을 Hostinger에 등록했다. 공개 TXT와 GitHub `Successfully verified` / `Verified`를 확인했다. 이어 대상 저장소 Pages의 Custom domain을 `haeum.haeonkorean.com`으로 저장했다. GitHub Actions 배포 방식·workflow·main 코드는 변경하지 않았다.
- **해움 DNS·인증서:** Pages 저장 후 `haeum CNAME → jasujung99.github.io`, TTL 14400을 추가하고 공개 CNAME을 확인했다. HTTP는 200이지만 초기 HTTPS 검증은 인증서 이름 불일치로 실패했다. DNS 반영 후 GitHub Check again을 실행하자 `Requesting a certificate` / `TLS certificate is being provisioned`로 진행했다. 현재 발급 완료·Enforce HTTPS 성공으로 보고하지 않는다.
- **현재 배포 URL 의존성:** 새 해움 HTTP에서 기존 main 공개 파일 41개 모두 200 및 main 원본과 바이트 일치, `/`·`/index.html`·실제 JS/CSS 포함 45 GET을 확인했다. 기존 main의 실제 `docsearch.ts`를 실행해 manifest+문서 25 GET 모두 200, 24문서 인덱스와 TOPIK 검색 4개를 확인했다. 이는 HTTP의 기존 main 검증이며 HTTPS나 PR 최종 번들 검증 완료는 아니다.
- **기존 주소·미완료:** 대표 Custom domain 변경 후 `.me`는 HTTPS 404이며 자동 리디렉션되지 않는다. `.me` DNS·등록은 변경하지 않았다. 새 해움 HTTPS·브라우저 전체 점검, 실제 답변·구독 POST 및 병합 후 최종 번들 검증은 미완료다. PR #4는 Draft이며 병합·main Actions 배포를 실행하지 않았다.

### 같은 날 HTTPS 준비 후 최종 재검증

인증서 준비 중이던 위 중간 상태 이후 GitHub `DNS check successful`, 유효한 HTTPS 200을 확인하고 Enforce HTTPS를 켰다. 설정 화면 재조회에서도 활성 상태를 확인했다. 초기에는 HTTP 캐시가 200이었지만 후속 조회에서 루트·쿼리 포함 루트·`/kb/manifest.json` 모두 원래 path/query를 보존하는 HTTPS 301을 확인했다.

- 새 **HTTPS**에서 기존 main 공개 파일 41개 모두 200 및 원본 바이트 일치. `/`·`/index.html`·배포 JS/CSS까지 총 45 GET 통과. 기존 실제 `docsearch.ts`의 manifest+문서 25 GET 모두 200, 24문서·24 section·TOPIK 검색 결과 4개 확인.
- HTTPS 홈·`/#/roa`·`/#/loading`·`/#/education-exam`의 해당 화면을 확인했다. 브라우저 Ctrl+R로 세 hash 경로를 새로고침한 뒤 URL·해당 화면이 유지됐다. 점검한 이미지 손상·브라우저 오류 로그는 없었고 DocBot 패널·질문 입력 UI도 열렸다. 실제 질문 전송·구독 POST는 실행하지 않았다.
- 네 앵커의 새 탭 직접 진입에서는 URL hash와 기존 section ID가 모두 보존됐다. 다만 기존 main은 초기 스크롤을 수행하지 않아 각 section의 위쪽 좌표가 422/731/1280/1666px였다. 이 기존 문제의 보완은 PR 로컬 최종 빌드에서 검증됐으며 아직 운영 적용되지 않았다. URL 존재와 초기 스크롤 성공을 구분한다.
- 기존 main 어휘 버튼은 아직 `https://boa-newwords.pages.dev`다. 준비된 새 어휘 주소는 직접 열어 검증했고 사용자도 로그인·기존 학습 정보 정상 확인을 제공했다. PR을 병합하기 전 운영 버튼이 새 주소로 바뀌었다고 보고하지 않는다.
- 기존 `.me`는 여전히 404로 자동 리디렉션되지 않는다. 두 새 주소의 인증서·현재 main 경로와 Worker OPTIONS 검증은 완료했지만, 최종 PR 번들 배포·그 번들의 앵커/링크 운영 점검, 실제 답변·구독 POST와 어휘 이메일/인쇄 전체 흐름은 미완료다. **PR #4는 Draft·미병합을 유지하며 병합은 별도 사용자 확인이 필요하다.**
