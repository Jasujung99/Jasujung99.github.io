# 도메인 변경 검증 기록

점검일: 2026-10-23~24 (Asia/Seoul). 운영 전환은 아직 적용하지 않았다. 설정·전환 순서·롤백은 [운영 안내](domain-migration.md)를 따른다. 아래 기존 검증 기록과 마지막의 후속 점검을 구분해 읽는다.

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

현재 PR #4는 Draft로 유지한다. 최신 전환 순서는 **Cloudflare Pages에 `words` 등록 → DNS `words` CNAME → 어휘 HTTPS·기능 → Worker old+new origin → GitHub Pages `haeum` 등록 → DNS `haeum` CNAME·HTTPS → 새 해움 모든 경로 점검 → 그 뒤에만 사용자 확인을 받아 PR #4 병합 검토**다. 어느 새 도메인이든 준비가 끝나지 않으면 병합을 보류한다. 운영 조작과 병합·배포는 이번 후속 코드 점검에서 실행하지 않는다.

병합 전 새 해움 운영 주소에서 확인할 수 있는 것은 기존 main의 배포 산출물이다. 변경안의 새 어휘 링크·facts·앵커 초기 스크롤 보완이 포함된 최종 번들은 로컬에서 먼저 검증하고, 사용자 승인 병합으로 기존 Actions가 배포한 뒤 운영에서 다시 확인해야 한다. 기존 main의 앵커 문제를 최종 수정본의 운영 성공으로 기록하지 않는다. 특히 `words.haeonkorean.com`의 HTTPS·학습 기능 성공은 새 어휘 링크가 main에 배포되기 **전에** 확인해야 한다. 병합 전 점검 결과와 병합 뒤 최종 번들 점검을 혼동하지 않는다.
