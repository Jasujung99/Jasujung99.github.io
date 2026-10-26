# 해움한국어 대표 주소 전환 안내

대상: `Jasujung99/Jasujung99.github.io` · 기존 `https://haeumkorean.me/` → 새 `https://haeum.haeonkorean.com/`

연결된 어휘 서비스는 기존 Cloudflare Pages 프로젝트 `boa-newwords`를 유지하며, 해움 화면의 링크만 `https://boa-newwords.pages.dev` → `https://words.haeonkorean.com`으로 변경한다. 어휘 프로젝트의 이전·삭제나 `pages.dev` 주소 비활성화는 하지 않는다. 전체 URL과 정적 파일 대응표는 [URL 점검 목록](url-migration-inventory.md), 어휘 저장소·운영 환경의 읽기 전용 조사 결과는 [어휘 도메인 점검](vocabulary-domain-audit.md)에 기록한다.

GitHub Pages와 기존 GitHub Actions 배포 구조를 유지한다. 코드 변경·PR 검토와 운영 전환은 별도 단계다. 사용자가 권장 순서의 운영 진행을 승인한 뒤 10월 24일 어휘 Custom domain 등록부터 진행했다. PR 병합은 별도 사용자 확인이 필요하다. Hostinger로 파일을 옮기거나 등록기관을 이전하지 않는다.

## 변경 전 확인한 상태

2026-10-23 공개 DNS 조회 기준이다. 실제 DNS 관리 화면의 영역 전체와 GitHub 계정·저장소 Pages 설정은 확인하지 못했다.

| 이름 / 종류 | 변경 전 값 | 처리 |
| --- | --- | --- |
| `haeonkorean.com` NS | `atlas.dns-parking.com`, `hyperion.dns-parking.com` | 유지 |
| `haeonkorean.com` A | `145.79.26.18` | 유지 |
| `haeonkorean.com` AAAA | `2a02:4780:5c:2193:0:34d7:68d8:2` | 유지 |
| `www.haeonkorean.com` CNAME | `haeonkorean.com` | 유지 |
| `haeum.haeonkorean.com` CNAME / A / AAAA / MX / TXT | DNS 이름 없음 | 관리자 화면 확인 후 `haeum` CNAME만 추가 |
| `words.haeonkorean.com` | 후속 공개 조회에서 DNS 이름 없음 | 관리자 화면에서 변경 전 값·충돌을 확인한 뒤 `words` CNAME만 설정 |
| `boa-newwords.pages.dev` | 기존 어휘 서비스 주소 | 기존 Pages 프로젝트·주소 유지 |
| `haeumkorean.me` NS | `dns1.registrar-servers.com`, `dns2.registrar-servers.com` | 이번 작업에서 유지 |
| `haeumkorean.me` A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` | 전환·롤백 계획에 따라 유지 |
| `haeumkorean.me` AAAA | 주소 응답 없음 | 기록만 유지 |

`dns-parking.com` 네임서버를 보면 새 도메인의 DNS는 Hostinger에서 관리할 가능성이 높다. 실제 로그인한 DNS 관리 화면에서 확인해야 한다. 도메인 구입처가 실제 DNS 관리업체와 같다고 가정하지 않는다. [Hostinger의 네임서버 확인 안내](https://www.hostinger.com/support/8671230-how-to-look-up-domain-nameservers-at-hostinger/)

로컬 환경은 처음에 Node.js 24가 발견되고 npm이 없었다. CI는 Node.js 20을 사용하므로 작업 전용 Node.js 20.20.2 / npm 10.8.2를 준비했다. 운영체제와 세부 패치 버전은 CI와 다를 수 있다. 수정 전·후 빌드 결과와 브라우저 검증 결과는 별도 검증 보고서에서 확인한다.

## 운영 진행 상태 (2026-10-26)

위 표는 변경 전 공개 DNS 기록이며, 아래는 로그인한 Cloudflare 관리 화면에서 확인한 후속 진행 상태다.

| 단계 | 확인·실행한 내용 | 남은 조건 |
| --- | --- | --- |
| 1. 어휘 Custom domain 등록 | 기존 `boa-newwords`의 `words.haeonkorean.com`이 `Active` / `SSL enabled` | 기존 프로젝트·배포·`pages.dev` 유지 |
| 2. `words` CNAME | Hostinger에 `words` → `boa-newwords.pages.dev`, 기본 TTL `14400` 추가. 공개 DNS 반영 확인 | 같은 이름의 기존 레코드는 없었음 |
| 3. 어휘 HTTPS·기능 | HTTPS 홈·`/auth`·`/reset-password` 200, 홈·로그인 화면 및 로그인 경로 새로고침 확인. 사용자가 새 주소의 로그인·기존 학습 정보 정상 확인 | 이메일 확인·비밀번호 재설정 메일·인쇄 전체 흐름과 인증 서비스 대시보드 설정 자체는 미검증 |
| 4. 운영 Worker | 적용 전 활성 `2ef03df4` 재확인 후 런타임 `ALLOWED_ORIGIN`을 old+new로 Deploy. 새 활성 버전 `e2af83d5`. 두 API × 두 Origin OPTIONS 모두 204 및 요청 Origin 하나와 일치하는 ACAO | 실제 답변 생성·구독 POST는 실행하지 않음. 운영 소스는 수정하지 않음 |
| 5. 해움 Pages | GitHub 발급 TXT로 `haeum.haeonkorean.com` 계정 소유권 검증 완료 후 저장소 Custom domain 저장. Source는 GitHub Actions 유지 | CNAME 파일과 별개인 실제 설정 변경 |
| 6. `haeum` DNS·HTTPS | Hostinger에 `haeum` → `jasujung99.github.io`, TTL `14400` 추가. 공개 CNAME·GitHub DNS 검사 성공·유효한 HTTPS 200 확인 후 Enforce HTTPS 활성화. 루트·KB 경로 HTTP→HTTPS 301 확인 | `.me`와 별도의 자동 리디렉션은 없음 |
| 7~8. 운영 검증·PR | 새 HTTPS에서 기존 main 공개 파일 41개·HTML·번들 총 45 GET, 실제 KB 로더 25 GET·검색, 네 React 화면·새로고침·이미지·DocBot 패널 확인. PR #4 Draft·main 미변경 | 네 앵커 ID·hash는 보존되지만 기존 main 초기 스크롤 문제는 PR 수정본 적용 대기. 병합은 별도 사용자 확인 필요 |

DNS 변경 전 영역을 내보내고 13개 레코드와 네임서버를 기록했다. 변경 후 16개와 비교해 원래 13개 변경·삭제가 없고, `words`·`haeum` CNAME과 `_github-pages-challenge-jasujung99.haeum` TXT 세 개만 추가됐음을 확인했다. 검증 값은 GitHub가 발급한 실제 값이며 추측하지 않았다. 무관한 `@`·`www`·메일·네임서버는 유지했다. 어휘 프로젝트의 production 배포도 유지했다.

대표 Custom domain 변경 뒤 기존 `https://haeumkorean.me/`는 현재 404이며 자동 리디렉션되지 않는다. 새 해움 HTTPS 인증서는 발급·검증을 마쳤다. 원래 `.me` DNS·등록은 변경하지 않았으며, 롤백 시 아래 절차로 Pages Custom domain을 복구해야 한다.

## 운영 전환 순서

최신 전환 순서는 **어휘 Custom domain 등록 → `words` DNS → 어휘 HTTPS·기능 → Worker 기존·새 출처 동시 허용 → GitHub Pages Custom domain → `haeum` DNS·HTTPS → 새 해움 경로 확인 → 그 뒤에만 PR #4 병합 검토**다. 두 새 주소의 운영 준비가 확인될 때까지 PR #4는 Draft로 유지하고 병합하지 않는다. 코드 파일 변경만으로 아래 운영 설정이 적용되는 것은 아니며, 실제 진행 범위는 위 상태표와 구분한다.

전환 전에 실제 DNS 관리업체에서 영역을 내보내거나 화면을 보관한다. `haeum`과 `words` 이름의 CNAME·A·AAAA·기타 레코드 충돌, 기존 GitHub Pages Custom domain·HTTPS 설정, Cloudflare Pages 연결과 Worker 활성 코드·런타임 변수를 기록한다. 공개 DNS에서 이름이 없었다는 결과만으로 관리자 화면 확인을 생략하지 않는다. `@`, `www`, 이메일용 MX·TXT, 무관한 레코드와 도메인 전체 네임서버는 변경하지 않는다.

GitHub 개인 계정 Settings → Pages의 Verified domains도 미리 확인한다. 동일 계정에서 `haeonkorean.com`이 검증되어 있다면 바로 아래 `haeum.haeonkorean.com`도 포함된다. 검증이 필요하면 GitHub 화면이 발급하는 TXT 이름·값을 실제 DNS 관리업체에 그대로 등록하고 Verify를 누른다. 토큰을 추측하거나 문서의 예시로 대체하지 않으며, 검증 후 TXT는 유지한다. 공개 challenge TXT 조회만으로 계정의 검증 완료 여부를 확정하지 않는다. [GitHub 도메인 검증](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)

1. **Cloudflare Pages에서 어휘 주소를 먼저 등록한다.** Workers & Pages → 기존 Pages 프로젝트 `boa-newwords` → Custom domains → Set up a domain에서 `words.haeonkorean.com`을 추가한다. 이 주소를 기존 프로젝트에 연결하며 프로젝트·저장소·배포 구조·`boa-newwords.pages.dev`는 유지한다. 외부 DNS에 CNAME만 먼저 추가하지 않는다. [Cloudflare Pages 하위 도메인 연결](https://developers.cloudflare.com/pages/configuration/custom-domains/)
2. **실제 DNS 관리업체에 어휘 CNAME을 설정한다.** 동일 `words` 이름의 충돌만 먼저 해결한 뒤 Type `CNAME`, Name/Host `words`, Target `boa-newwords.pages.dev`, TTL 기본값을 적용한다. Target에 `https://`나 경로를 넣지 않는다. 하위 도메인 연결 때문에 도메인 전체 네임서버를 Cloudflare로 이전하지 않는다.
3. **어휘 HTTPS와 기능이 먼저 정상인지 확인한다.** Cloudflare의 Custom domain 활성 상태와 인증서를 확인하고 `https://words.haeonkorean.com`에서 기존 `https://boa-newwords.pages.dev`와 화면·직접 경로·새로고침·이미지·학습 기능을 비교한다. HTTP 성공 상태만으로 기능 성공을 판단하지 않는다. 준비되지 않았다면 여기서 운영 전환을 멈추고 PR #4는 Draft로 유지한다.
4. **Cloudflare 운영 Worker에서 기존·새 해움 출처를 동시에 허용하고 확인한다.** 아래 Worker 절차대로 실제 배포 구현을 대조한 뒤 `ALLOWED_ORIGIN`을 `https://haeumkorean.me,https://haeum.haeonkorean.com`으로 적용한다. 답변·구독 두 API의 두 출처 OPTIONS 결과가 각각 요청 출처 하나를 허용하는지 확인한 후 다음 단계로 간다. 샘플 파일 수정과 운영 Worker 변경은 별개다.
5. **대상 저장소 Settings → Pages → Custom domain**에 `haeum.haeonkorean.com`을 입력하고 Save한다. 관리자 권한이 필요하다. Actions 배포에서 CNAME 파일은 GitHub가 무시하며 실제 Custom domain의 기준이 아니다. 루트·public CNAME 파일의 수정은 설정값의 일관성을 위한 것이고, 실제 도메인은 이 Pages 설정으로 변경한다. 기존 배포 워크플로와 Vite의 base `/`는 유지한다. [GitHub Actions와 Custom domain의 관계](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
6. **그다음 실제 DNS 관리업체에서 해움 CNAME을 설정하고 DNS·HTTPS를 확인한다.** 동일 `haeum` 이름의 충돌만 해결하고 다른 이름의 레코드나 DNS 영역 전체를 삭제하지 않는다.

   | 항목 | 값 |
   | --- | --- |
   | Type | `CNAME` |
   | Name / Host | `haeum` |
   | Target / Points to | `jasujung99.github.io` |
   | TTL | 기본값 |

   Target에 `https://`, 경로, 저장소 이름을 덧붙이지 않는다. GitHub에 먼저 Custom domain을 등록하고 DNS를 설정하는 순서다. GitHub의 DNS 확인과 인증서 발급을 확인한 뒤 Enforce HTTPS를 켠다. DNS 전파·인증서 발급을 기다리는 동안 성공으로 기록하지 않는다. 해온 본사이트의 `@`나 `www`를 GitHub Pages로 바꾸지 않는다. [GitHub 하위 도메인 설정](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain), [GitHub 인증서 발급](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
7. **새 해움 주소의 모든 경로를 확인한다.** [URL 점검 목록](url-migration-inventory.md)의 화면·앵커·KB·이미지·정적 파일을 새 주소에서 확인하고, 문의·예약 링크와 새 출처의 API도 확인한다. 해온 본사이트의 기존 동작도 비교한다. 이 단계에서는 아직 PR을 병합하지 않았으므로 **기존 main의 배포 산출물**을 확인한다. 제안된 새 어휘 링크·facts·앵커 초기 스크롤 보완이 포함된 최종 번들의 운영 검증 완료를 뜻하지 않는다. 기존 main의 앵커 문제는 기록하고 최종 수정본의 운영 성공으로 간주하지 않는다. 기존 main의 어휘 버튼이 아직 `pages.dev`를 가리키면 새 어휘 주소는 직접 열어 3단계 검증을 완료한다.
8. **위 운영 준비와 로컬 검증이 끝난 뒤에만 PR #4 병합을 검토한다.** 병합은 자동 실행하지 않으며 별도의 사용자 확인이 필요하다. main에 반영되면 기존 Actions가 배포를 실행하므로, 그 결과에서 새 어휘 링크·facts·CNAME 등 최종 번들을 다시 운영 확인한다. 운영 설정 진행 승인과 PR 병합 승인을 구분하며 현재 병합·GitHub Actions 운영 배포는 실행하지 않았다.

기존 `.me`의 폐기·리디렉션은 새 주소의 운영 검증과 롤백 필요 기간이 끝난 뒤 별도로 결정한다. 도메인 등록·갱신·삭제·이전은 이 코드 작업의 실행 대상이 아니다. 기존 `.me` 주소를 완전히 폐기한 후에만 Worker 허용 목록에서 기존 출처를 제거하고 다시 검증한다. 아래 리디렉션 한계를 먼저 확인한다.

## 주요 경로와 정적 파일 대응

아래는 기존 주소와 새 주소에서 같은 경로를 유지하는 점검 요약이다. 행의 `…`는 두 해움 origin 각각을 뜻한다. 전체 외부 URL 분류, 정확한 KB 파일명과 `public` 파일 목록, 자동 점검 방법은 [URL 점검 목록](url-migration-inventory.md)에 있다. 경로를 `/haeum/` 아래로 옮기지 않는다.

| 종류 | 기존 URL | 새 URL | 점검 |
| --- | --- | --- | --- |
| 홈 | `https://haeumkorean.me/`, `…/#/` | `https://haeum.haeonkorean.com/`, `…/#/` | 첫 화면·새로고침 |
| 교육·시험 | `…/#/education-exam` | `…/#/education-exam` | 직접 진입·메뉴 이동·새로고침 |
| 로아 / 이전 호환 경로 | `…/#/roa`, `…/#/loading` | `…/#/roa`, `…/#/loading` | 직접 진입·돌아가기 |
| 홈 앵커 | `…/#about`, `…/#programs`, `…/#online-learning`, `…/#contact` | 같은 네 앵커 | 해당 섹션과 어휘 버튼 확인 |
| 상담 앵커 | `…/#lead` | `…/#lead` | 기존 App hash 라우팅 충돌은 점검 목록에 별도 기록; 이번 주소 변경의 수정 범위 밖 |
| KB 목록 | `…/kb/manifest.json` | `…/kb/manifest.json` | JSON과 각 항목 로딩 |
| KB 문서 전체군 | `…/kb/about.md`, `…/kb/blog-clean.txt`, `…/kb/blog/{slug}.md` 전체 | 같은 경로 | manifest 24개 항목(블로그 22개 포함) 전체 |
| KB 원문 보관본 | `…/kb/blog-original-materials.txt` | 같은 경로 | 직접 정적 파일 응답; manifest 로딩 대상과 구분 |
| 정적 이미지·아이콘 | `…/assets/0011.jpg`, `…/assets/0021.jpg`, `…/assets/kb/*`, `…/icons/*`, `…/favicon.svg`, `…/assets/haeum-favicon.svg` | 같은 경로 | 전체 public 목록과 파일 응답·이미지 표시 비교 |
| 빌드 자산 | `…/assets/{빌드파일}.js`, `…/assets/{빌드파일}.css` | 같은 `/assets/` 아래 새 빌드 파일 | 이름의 해시는 빌드별로 다를 수 있음; HTML 참조 일치·404 확인 |
| 어휘 서비스 | `https://boa-newwords.pages.dev` | `https://words.haeonkorean.com` | 기존 Pages 유지·새 HTTPS/기능 먼저 검증 |

## 운영 Worker와 CORS

실제 공개 API는 `https://sweet-bird-16a2.jasujung404.workers.dev`의 `/api/answer`, `/api/subscribe`다. 10월 23일과 24일 13:19 KST의 OPTIONS 점검에서 새 출처 요청은 HTTP 204를 반환했지만 `Access-Control-Allow-Origin`은 `https://haeumkorean.me`였다. 따라서 당시 새 출처는 브라우저의 CORS 사전 요청을 통과할 수 없었다. 실제 POST나 구독 등록은 실행하지 않았다.

10월 24일 Cloudflare Deployments의 **활성 버전 `2ef03df4`, 트래픽 100%**와 편집기의 같은 Active 버전을 대조해 운영 코드를 직접 확인했다. 편집기 파일명은 `worker.js`였으며 `/api/answer`와 `/api/subscribe` 두 경로에 모두 `isAllowedOrigin` 판정을 적용한다. `corsHeaders`와 `isAllowedOrigin`은 `ALLOWED_ORIGIN`을 `split(',')`와 `trim()`으로 나누고, 요청·허용 항목의 `new URL(...).origin`을 비교한다. 허용 응답에는 요청 Origin 하나만 반환한다. 따라서 **현재 활성 코드의 복수 출처 지원은 확인 완료**다. 이 판정은 기존 OPTIONS 응답만으로 추정한 결과가 아니며, 저장소의 동명 구독 전용 샘플과 운영 소스 전체가 같다는 뜻도 아니다.

변경 전 환경변수는 Type `Variable`, `ALLOWED_ORIGIN = https://haeumkorean.me`였다. 10월 26일 어휘 HTTPS와 사용자 로그인·학습 정보 확인 후 **`https://haeumkorean.me,https://haeum.haeonkorean.com`**으로 Deploy했다. 활성 버전은 `e2af83d5`이며 두 API의 기존·새 출처 OPTIONS 네 건 모두 204와 각 요청 Origin 하나의 ACAO를 확인했다. Worker 소스나 Secrets는 수정하지 않았다. 미허용 Origin의 OPTIONS는 기존 구현상 쉼표 목록 헤더를 반환하지만 유효한 CORS 허용 값이 아니어서 브라우저는 허용하지 않는다. 이 음성 대조를 허용 성공으로 세지 않는다. 실제 POST의 답변·구독 처리 성공은 미검증이다.

저장소의 `samples/worker` 변경은 샘플 변경이며 운영 Worker 배포나 대시보드 설정 변경을 의미하지 않는다. 세 샘플의 로컬 회귀 테스트, 운영 코드 직접 검사, 10월 26일 런타임 변수 적용·요청 검증은 각각 별도 결과다.

`answer-worker.ts`는 명시적인 허용 목록이 없거나 `*`만 지정된 경우 요청을 403으로 거절한다. `unified-worker.js`와 `worker.js`의 기존 미설정·`*` fallback 로직은 이번 변경에서 유지했으므로 운영에서는 아래의 정확한 `ALLOWED_ORIGIN` 값을 반드시 지정한다. 세 샘플 모두 요청 Origin 하나를 허용 목록과 대조하는 동작을 로컬 회귀 테스트로 확인했다.

사용자가 진행할 Cloudflare 절차는 다음과 같다.

1. **Workers & Pages → `sweet-bird-16a2` → Deployments 및 Settings → Variables and Secrets**를 연다. 위의 복수 출처 지원 검사는 완료했으며, 실제 적용 직전에도 활성 버전·트래픽·환경변수가 기록과 같은지 확인한다. 이후 코드가 바뀌었다면 두 API의 판정과 응답 처리를 재확인한다. 단일 문자열을 헤더에 그대로 넣는 구현이면 값에 쉼표만 추가해서는 해결되지 않는다.
2. `ALLOWED_ORIGIN`을 일반 텍스트 값으로 추가·수정한다. 값은 **`https://haeumkorean.me,https://haeum.haeonkorean.com`**이다. 두 값에 `https://`를 포함하고 마지막 `/`는 붙이지 않는다. API 키 등 기존 Secrets는 변경하거나 출력하지 않는다.
3. **Deploy**로 변경을 운영에 적용하고 활성 배포를 확인한다. 화면에서 값을 입력·저장한 것만으로 적용 완료로 판단하지 않는다. 이 항목은 빌드 전용 환경변수가 아닌 Worker의 런타임 변수다. [Cloudflare 런타임 변수 설정 절차](https://developers.cloudflare.com/workers/configuration/environment-variables/#add-environment-variables-via-the-dashboard)
4. 아래 OPTIONS 명령으로 기존·새 출처를 모두 확인한다. 각 응답의 `Access-Control-Allow-Origin`은 해당 요청 Origin 하나여야 한다. 두 주소를 쉼표로 합친 헤더나 `*`로 완화하지 않는다. 두 출처 모두 허용된 것이 확인된 뒤 GitHub Pages Custom domain과 `haeum` DNS를 전환한다.

## 적용 후 확인 명령과 브라우저 점검

PowerShell에서 실행한다. 아래 API 명령은 OPTIONS만 보내며 실제 POST를 실행하지 않는다.

```powershell
Resolve-DnsName words.haeonkorean.com -Type CNAME
curl.exe -I https://words.haeonkorean.com/
curl.exe -I https://boa-newwords.pages.dev/
Resolve-DnsName haeum.haeonkorean.com -Type CNAME
Resolve-DnsName haeum.haeonkorean.com -Type A
Resolve-DnsName haeum.haeonkorean.com -Type AAAA
curl.exe -I https://haeum.haeonkorean.com/
curl.exe -I http://haeum.haeonkorean.com/
curl.exe -I https://haeonkorean.com/
curl.exe -I https://www.haeonkorean.com/

$apiBase = 'https://sweet-bird-16a2.jasujung404.workers.dev'
foreach ($origin in @('https://haeumkorean.me', 'https://haeum.haeonkorean.com')) {
    foreach ($path in @('/api/answer', '/api/subscribe')) {
        Write-Output "$origin $path"
        curl.exe --silent --show-error --max-time 20 -D - -o NUL `
            -X OPTIONS "$apiBase$path" `
            -H "Origin: $origin" `
            -H 'Access-Control-Request-Method: POST' `
            -H 'Access-Control-Request-Headers: content-type'
    }
}
```

- `words` CNAME은 `boa-newwords.pages.dev`, `haeum` CNAME은 `jasujung99.github.io`인지 각각 확인한다. 새 HTTPS 인증서가 유효한지, 해움 HTTP가 HTTPS로 전환되는지 확인한다.
- `words.haeonkorean.com`과 기존 `boa-newwords.pages.dev`에서 어휘 화면·직접 경로·학습 기능이 같은지 확인한다. 새 어휘 서비스 준비가 끝나기 전에 새 링크가 포함된 PR을 병합하지 않는다.
- API OPTIONS의 성공 상태뿐 아니라 `Access-Control-Allow-Origin: https://haeum.haeonkorean.com`, POST와 content-type 허용 헤더도 확인한다. OPTIONS 성공만으로 실제 API 처리가 검증된 것은 아니다.
- 데스크톱·모바일 주요 화면, 이미지, 메뉴, 직접 링크와 새로고침, 외부 문의·예약 링크, 브라우저 개발자 도구의 CORS·혼합 콘텐츠·404 오류를 확인한다. 실제 구독 등 데이터를 만드는 테스트는 별도로 의도한 경우에만 수행한다.
- 해온 본사이트 `haeonkorean.com`과 `www.haeonkorean.com`의 기존 응답·화면·이동 경로를 변경 전과 비교한다.

초기 로컬·전환 전 점검과 10월 26일 실제 운영 설정 변경은 [환경·검증 기록](domain-migration-validation.md)에서 구분한다. 두 새 주소 HTTPS·Worker 두 Origin OPTIONS는 확인됐다. 최종 PR 번들 운영 배포, 그 번들의 새 어휘 링크·앵커 보완 운영 확인, 실제 API POST 성공은 아직 확인되지 않았다.

## 되돌리기와 기존 주소

1. 변경 전 기록과 전환 시점을 확인하고 롤백을 결정한다. main을 강제 덮어쓰지 말고 주소 변경 커밋을 되돌리는 별도 PR을 검토한 뒤 사용자 확인을 받아 반영한다.
2. 저장소 Pages Custom domain을 `haeumkorean.me`로 복구한다. 기존 `.me` 등록·DNS가 유효하고 위 GitHub Pages A 레코드가 유지되는지 확인한 뒤 DNS 확인·인증서·HTTPS를 다시 확인한다.
3. 이번에 추가·변경한 `haeum` 레코드만 변경 전 상태로 복원한다. 이번 공개 조회상은 이름 없음이었지만, 실제 관리자 화면에서 보관한 변경 전 기록을 우선한다. `@`, `www`, MX·TXT와 네임서버는 건드리지 않는다.
4. 운영 Worker를 변경했다면 기록해 둔 허용 출처·운영 소스로 되돌리고 `.me`에서 CORS와 실제 기능을 다시 확인한다. 샘플 파일 복구만으로 운영 Worker가 복구되지는 않는다.
5. 어휘 링크를 되돌려야 하면 `src/pages/HaeumHomePage.tsx`의 링크를 기존 `https://boa-newwords.pages.dev`로 복구하는 PR을 검토한다. 기존 Pages 프로젝트와 주소는 유지하므로 해당 주소의 기능을 먼저 확인한다.
6. `words` DNS를 변경했다면 **해당 이름만** 관리자 화면에서 보관한 변경 전 상태로 복원한다. 공개 DNS의 NXDOMAIN 기록을 근거로 기존 관리자 레코드를 무조건 삭제하지 않는다. 새 `words.haeonkorean.com` 연결을 해제할 필요가 있다면 DNS 복구와 별개로 Cloudflare Pages → `boa-newwords` → Custom domains에서 정확한 도메인만 사용자 확인 후 해제한다. 다른 연결 도메인·Pages 프로젝트·`pages.dev` 주소는 삭제하지 않는다. DNS 복원 후 다시 Pages에 연결할 때 활성화·인증서 확인이 필요할 수 있다. [Cloudflare 연결 해제와 재연결 주의](https://developers.cloudflare.com/pages/configuration/custom-domains/)

기존 `.me` → 새 `.com`의 자동 리디렉션은 보장되지 않는다. GitHub가 제공하는 apex·`www` 쌍의 자동 리디렉션과 서로 다른 두 도메인 간 이전은 구분해야 한다. 이전 주소를 계속 새 주소로 보내려면 HTTPS를 지원하는 별도 리디렉션 서비스와 `.me`의 유효한 등록·DNS 유지가 필요하며, 이는 별도 설정·승인 대상이다. 기존 도메인 만료 후에도 유지된다고 약속할 수 없다. [GitHub 자동 리디렉션 범위](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)

대상은 계정의 사용자 사이트 저장소이므로, 같은 계정의 다른 프로젝트 Pages가 자체 Custom domain 없이 사용자 사이트 주소를 상속한다면 그 프로젝트 URL도 영향을 받을 수 있다. 해당 프로젝트의 존재·상속 여부는 미확인이다. 이번 작업에서 해온 본사이트나 다른 프로젝트의 코드·배포는 변경하지 않는다. [사용자 사이트 도메인 상속](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages#using-a-custom-domain-across-multiple-repositories)
