# 해움한국어 대표 주소 전환 안내

대상: `Jasujung99/Jasujung99.github.io` · 기존 `https://haeumkorean.me/` → 새 `https://haeum.haeonkorean.com/`

GitHub Pages와 기존 GitHub Actions 배포 구조를 유지한다. 코드 변경·PR 검토와 운영 전환은 별도 단계다. PR 병합, 운영 배포, Pages 설정, DNS, 운영 Worker 변경은 사용자 확인 후 진행한다. Hostinger로 파일을 옮기거나 등록기관을 이전하지 않는다.

## 변경 전 확인한 상태

2026-10-23 공개 DNS 조회 기준이다. 실제 DNS 관리 화면의 영역 전체와 GitHub 계정·저장소 Pages 설정은 확인하지 못했다.

| 이름 / 종류 | 변경 전 값 | 처리 |
| --- | --- | --- |
| `haeonkorean.com` NS | `atlas.dns-parking.com`, `hyperion.dns-parking.com` | 유지 |
| `haeonkorean.com` A | `145.79.26.18` | 유지 |
| `haeonkorean.com` AAAA | `2a02:4780:5c:2193:0:34d7:68d8:2` | 유지 |
| `www.haeonkorean.com` CNAME | `haeonkorean.com` | 유지 |
| `haeum.haeonkorean.com` CNAME / A / AAAA / MX / TXT | DNS 이름 없음 | 관리자 화면 확인 후 `haeum` CNAME만 추가 |
| `haeumkorean.me` NS | `dns1.registrar-servers.com`, `dns2.registrar-servers.com` | 이번 작업에서 유지 |
| `haeumkorean.me` A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` | 전환·롤백 계획에 따라 유지 |
| `haeumkorean.me` AAAA | 주소 응답 없음 | 기록만 유지 |

`dns-parking.com` 네임서버를 보면 새 도메인의 DNS는 Hostinger에서 관리할 가능성이 높다. 실제 로그인한 DNS 관리 화면에서 확인해야 한다. 도메인 구입처가 실제 DNS 관리업체와 같다고 가정하지 않는다. [Hostinger의 네임서버 확인 안내](https://www.hostinger.com/support/8671230-how-to-look-up-domain-nameservers-at-hostinger/)

로컬 환경은 처음에 Node.js 24가 발견되고 npm이 없었다. CI는 Node.js 20을 사용하므로 작업 전용 Node.js 20.20.2 / npm 10.8.2를 준비했다. 운영체제와 세부 패치 버전은 CI와 다를 수 있다. 수정 전·후 빌드 결과와 브라우저 검증 결과는 별도 검증 보고서에서 확인한다.

## 운영 전환 순서

전환의 핵심 순서는 **Cloudflare에서 기존·새 출처 동시 허용 → GitHub Pages Custom domain 변경 → `haeum` CNAME 설정 → DNS·HTTPS 확인 → 새 주소 기능 확인 → 마지막에 `.me` 폐기 검토**다. 아래 준비를 먼저 하고, 각 운영 변경은 사용자 확인 후 진행한다.

1. **DNS 관리업체와 변경 전 상태를 기록한다.** DNS 영역을 내보내거나 화면을 보관하고, `haeum` 이름의 CNAME·A·AAAA·기타 레코드 충돌을 확인한다. 공개 DNS에서 이름이 없었다는 결과만으로 관리자 화면 확인을 생략하지 않는다. `@`, `www`, 이메일용 MX·TXT, 무관한 레코드와 도메인 전체 네임서버는 변경하지 않는다.
2. **GitHub 계정 수준의 도메인 검증을 확인한다.** 개인 계정 Settings → Pages의 Verified domains에서 확인한다. 동일 계정에서 `haeonkorean.com`이 검증되어 있다면 바로 아래 `haeum.haeonkorean.com`도 포함된다. 검증이 필요하면 GitHub 화면이 발급하는 TXT 이름·값을 실제 DNS 관리업체에 그대로 등록하고 Verify를 누른다. 토큰을 추측하거나 문서의 예시로 대체하지 않으며, 검증 후 TXT는 유지한다. 공개 challenge TXT 조회만으로 계정의 검증 완료 여부를 확정하지 않는다. [GitHub 도메인 검증](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
3. **Cloudflare의 운영 Worker에서 기존·새 출처를 동시에 허용하고 확인한다.** 아래 Worker 절차대로 실제 배포 구현을 대조한 뒤 `ALLOWED_ORIGIN`을 `https://haeumkorean.me,https://haeum.haeonkorean.com`으로 적용한다. 두 출처의 OPTIONS 결과가 각각 요청 출처를 허용하는지 확인한 후 다음 단계로 간다. 코드 PR의 main 적용·병합 시점은 사용자와 따로 정한다. main 반영이 배포를 실행하므로, Worker 준비 후 이어지는 사이트 전환 시간에 맞춰 검토·승인된 코드만 적용하고 배포 결과를 확인한다. 기존 워크플로는 변경하지 않으며 Vite의 base는 `/`를 유지한다.
4. **대상 저장소 Settings → Pages → Custom domain**에 `haeum.haeonkorean.com`을 입력하고 Save한다. 관리자 권한이 필요하다. Actions 배포에서 CNAME 파일은 GitHub가 무시하며 실제 Custom domain의 기준이 아니다. 루트·public CNAME 파일의 수정은 설정값의 일관성을 위한 것이고, 실제 도메인은 이 Pages 설정으로 변경한다. [GitHub Actions와 Custom domain의 관계](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
5. **그다음 실제 DNS 관리업체에서 다음 레코드를 설정한다.** 동일 `haeum` 이름의 충돌만 해결하고 다른 이름의 레코드나 DNS 영역 전체를 삭제하지 않는다.

   | 항목 | 값 |
   | --- | --- |
   | Type | `CNAME` |
   | Name / Host | `haeum` |
   | Target / Points to | `jasujung99.github.io` |
   | TTL | 기본값 |

   Target에 `https://`, 경로, 저장소 이름을 덧붙이지 않는다. GitHub에 먼저 Custom domain을 등록하고 DNS를 설정하는 순서다. [GitHub 하위 도메인 설정](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain)
6. **GitHub의 DNS 확인과 인증서 발급을 확인한 뒤 Enforce HTTPS를 켠다.** DNS 전파 및 HTTPS 옵션 활성화까지 시간이 걸릴 수 있다. 이 하위 도메인을 연결하기 위해 해온 본사이트의 `@`나 `www`를 GitHub Pages로 바꾸지 않는다. [GitHub 인증서 발급 과정](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
7. **새 주소에서 기능을 확인한다.** 아래 명령과 브라우저 점검으로 화면·이미지·메뉴·외부 링크·API를 확인한다. 기존 출처는 아직 Worker 허용 목록에 남겨 둔다.
8. **마지막에 기존 `.me`의 폐기·리디렉션 여부를 결정한다.** 새 주소의 운영 검증과 롤백 필요 기간이 끝난 뒤에만 사용자 확인을 받아 진행한다. 도메인 등록·갱신·삭제·이전은 이 코드 작업의 실행 대상이 아니다. 기존 `.me` 주소를 완전히 폐기한 후에만 Worker 허용 목록에서 기존 출처를 제거하고 다시 검증한다. 아래 리디렉션 한계를 먼저 확인한다.

## 운영 Worker와 CORS

실제 공개 API는 `https://sweet-bird-16a2.jasujung404.workers.dev`의 `/api/answer`, `/api/subscribe`다. 새 출처를 담은 OPTIONS 요청은 HTTP 204를 반환했지만 `Access-Control-Allow-Origin`은 `https://haeumkorean.me`였다. 따라서 새 출처와 헤더가 일치하지 않아 브라우저의 CORS 사전 요청을 통과할 수 없는 상태다. 실제 POST나 구독 등록은 실행하지 않았다.

저장소의 `samples/worker` 변경은 샘플 변경이며 운영 Worker 배포나 대시보드 설정 변경을 의미하지 않는다. 이번 변경안은 `worker.js`, `unified-worker.js`, `answer-worker.ts` 세 샘플의 쉼표 구분 출처 허용을 일치시키지만, 실제 배포된 운영 코드도 같다는 뜻은 아니다. 운영 환경변수의 실제 값과 운영 소스는 대시보드에서 확인하지 못했다.

`answer-worker.ts`는 명시적인 허용 목록이 없거나 `*`만 지정된 경우 요청을 403으로 거절한다. `unified-worker.js`와 `worker.js`의 기존 미설정·`*` fallback 로직은 이번 변경에서 유지했으므로 운영에서는 아래의 정확한 `ALLOWED_ORIGIN` 값을 반드시 지정한다. 세 샘플 모두 요청 Origin 하나를 허용 목록과 대조하는 동작을 로컬 회귀 테스트로 확인했다.

사용자가 진행할 Cloudflare 절차는 다음과 같다.

1. **Workers & Pages → `sweet-bird-16a2` → Settings → Variables and Secrets**를 연다. 현재 운영 배포의 코드 또는 내보낸 소스를 저장소 샘플과 대조하여 `ALLOWED_ORIGIN`을 쉼표로 분리하고, 요청 Origin을 허용 목록과 정확히 대조한 뒤 해당 Origin 하나만 응답하는지 확인한다. 단일 문자열을 헤더에 그대로 넣는 구현이면 먼저 운영 코드를 별도로 검토·승인해 수정해야 한다. 값에 쉼표만 추가해서는 해결되지 않는다.
2. `ALLOWED_ORIGIN`을 일반 텍스트 값으로 추가·수정한다. 값은 **`https://haeumkorean.me,https://haeum.haeonkorean.com`**이다. 두 값에 `https://`를 포함하고 마지막 `/`는 붙이지 않는다. API 키 등 기존 Secrets는 변경하거나 출력하지 않는다.
3. **Deploy**로 변경을 운영에 적용하고 활성 배포를 확인한다. 화면에서 값을 입력·저장한 것만으로 적용 완료로 판단하지 않는다. 이 항목은 빌드 전용 환경변수가 아닌 Worker의 런타임 변수다. [Cloudflare 런타임 변수 설정 절차](https://developers.cloudflare.com/workers/configuration/environment-variables/#add-environment-variables-via-the-dashboard)
4. 아래 OPTIONS 명령으로 기존·새 출처를 모두 확인한다. 각 응답의 `Access-Control-Allow-Origin`은 해당 요청 Origin 하나여야 한다. 두 주소를 쉼표로 합친 헤더나 `*`로 완화하지 않는다. 두 출처 모두 허용된 것이 확인된 뒤 Pages·DNS를 전환한다.

## 적용 후 확인 명령과 브라우저 점검

PowerShell에서 실행한다. 아래 API 명령은 OPTIONS만 보내며 실제 POST를 실행하지 않는다.

```powershell
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

- CNAME의 목적지가 `jasujung99.github.io`인지, 새 HTTPS 인증서가 유효한지, HTTP가 HTTPS로 전환되는지 확인한다.
- API OPTIONS의 성공 상태뿐 아니라 `Access-Control-Allow-Origin: https://haeum.haeonkorean.com`, POST와 content-type 허용 헤더도 확인한다. OPTIONS 성공만으로 실제 API 처리가 검증된 것은 아니다.
- 데스크톱·모바일 주요 화면, 이미지, 메뉴, 직접 링크와 새로고침, 외부 문의·예약 링크, 브라우저 개발자 도구의 CORS·혼합 콘텐츠·404 오류를 확인한다. 실제 구독 등 데이터를 만드는 테스트는 별도로 의도한 경우에만 수행한다.
- 해온 본사이트 `haeonkorean.com`과 `www.haeonkorean.com`의 기존 응답·화면·이동 경로를 변경 전과 비교한다.

최초 샌드박스 내 HTTPS 연결 시도는 환경의 외부 접속 제한으로 실패했지만, 이후 허용된 읽기 전용 재점검에서 기존 `.me`와 해온 본사이트 `@`·`www` 모두 HTTP 200을 확인했다. 새 도메인의 운영 DNS·HTTPS·API 기능은 아직 전환 전이다. [환경·검증 기록](domain-migration-validation.md)에서 로컬 결과와 운영 미완료 항목을 구분한다.

## 되돌리기와 기존 주소

1. 변경 전 기록과 전환 시점을 확인하고 롤백을 결정한다. main을 강제 덮어쓰지 말고 주소 변경 커밋을 되돌리는 별도 PR을 검토한 뒤 사용자 확인을 받아 반영한다.
2. 저장소 Pages Custom domain을 `haeumkorean.me`로 복구한다. 기존 `.me` 등록·DNS가 유효하고 위 GitHub Pages A 레코드가 유지되는지 확인한 뒤 DNS 확인·인증서·HTTPS를 다시 확인한다.
3. 이번에 추가·변경한 `haeum` 레코드만 변경 전 상태로 복원한다. 이번 공개 조회상은 이름 없음이었지만, 실제 관리자 화면에서 보관한 변경 전 기록을 우선한다. `@`, `www`, MX·TXT와 네임서버는 건드리지 않는다.
4. 운영 Worker를 변경했다면 기록해 둔 허용 출처·운영 소스로 되돌리고 `.me`에서 CORS와 실제 기능을 다시 확인한다. 샘플 파일 복구만으로 운영 Worker가 복구되지는 않는다.

기존 `.me` → 새 `.com`의 자동 리디렉션은 보장되지 않는다. GitHub가 제공하는 apex·`www` 쌍의 자동 리디렉션과 서로 다른 두 도메인 간 이전은 구분해야 한다. 이전 주소를 계속 새 주소로 보내려면 HTTPS를 지원하는 별도 리디렉션 서비스와 `.me`의 유효한 등록·DNS 유지가 필요하며, 이는 별도 설정·승인 대상이다. 기존 도메인 만료 후에도 유지된다고 약속할 수 없다. [GitHub 자동 리디렉션 범위](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)

대상은 계정의 사용자 사이트 저장소이므로, 같은 계정의 다른 프로젝트 Pages가 자체 Custom domain 없이 사용자 사이트 주소를 상속한다면 그 프로젝트 URL도 영향을 받을 수 있다. 해당 프로젝트의 존재·상속 여부는 미확인이다. 이번 작업에서 해온 본사이트나 다른 프로젝트의 코드·배포는 변경하지 않는다. [사용자 사이트 도메인 상속](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages#using-a-custom-domain-across-multiple-repositories)
