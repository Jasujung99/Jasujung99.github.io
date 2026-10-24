# 어휘 학습 주소 전환: 읽기 전용 점검

점검일: 2026-10-23~24 · 기존 `https://boa-newwords.pages.dev/` → 새 `https://words.haeonkorean.com/`

기존 Cloudflare Pages 프로젝트 `boa-newwords`의 호스팅·배포를 유지하고 사용자 지정 도메인을 연결하는 작업이다. 다른 저장소의 코드나 설정, Cloudflare 운영 설정과 DNS는 이번 점검에서 변경하지 않았다. 신규 PR 생성·병합·배포도 실행하지 않았다.

## 현재 확인한 사항

| 항목 | 읽기 전용 확인 결과 |
| --- | --- |
| `words.haeonkorean.com` CNAME / A / AAAA | DNS 이름 없음 |
| `boa-newwords.pages.dev` A | `172.66.47.203`, `172.66.44.53` |
| `boa-newwords.pages.dev` AAAA | `2606:4700:310c::ac42:2c35`, `2606:4700:310c::ac42:2fcb` |
| 기존 주소의 HTTPS·응답 헤더 | 18:47 KST 외부 HTTP HEAD 확인: HTTP 200, `Server: cloudflare` |
| 기존 주소의 실제 HTML·화면·기능 | 미확인 |
| 새 주소의 HTTPS | DNS 미설정으로 미확인 |
| 실제 배포 저장소·운영 커밋과 소스 일치 | Cloudflare 대시보드의 Git 연결·배포 정보를 대조하지 못해 미확정 |
| Cloudflare Custom domains / 인증서 상태 | 대시보드 연결이 없어 미확인 |
| 실제 운영 인증 설정·CORS 허용 목록 | 해당 운영 대시보드를 확인하지 못해 미확인 |

처음 제한된 실행 환경에서는 HTTPS 연결에 실패했으나, 별도 허용된 외부 읽기에서는 기존 주소의 HTTPS HTTP 200을 확인했다. 이는 기존 호스팅의 응답을 확인한 것이며 로그인·학습 기능 전체를 검증한 결과는 아니다. 새 도메인은 DNS 해석 실패가 이어져 아직 활성 완료로 보고할 수 없다.

10월 24일 13:19 KST 재점검에서도 기존 주소 HEAD는 200, 새 주소의 시스템 HTTPS 요청은 `ENOTFOUND`였다. Node의 별도 DNS 질의는 `ECONNREFUSED`여서 그 질의로 현재 레코드 상태를 단정하지 않는다. 위 NXDOMAIN·A/AAAA 값은 10월 23일의 DNS 조회 기록이다.

## 사용자가 진행할 Cloudflare Pages 설정

1. **Workers & Pages → Pages 프로젝트 `boa-newwords` → Custom domains → Set up a domain**에서 `words.haeonkorean.com`을 먼저 등록한다. 프로젝트의 Git 연결·운영 브랜치·배포 커밋을 기록하고 실제 소스와 대조한다. 다른 프로젝트를 만들거나 호스팅을 옮기지 않는다.
2. 실제 `haeonkorean.com` DNS 관리 화면에서 변경 전 상태를 기록한다. `words`와 같은 이름에 충돌하는 레코드가 없는지 확인한 뒤 아래 CNAME만 추가한다.

   | 항목 | 값 |
   | --- | --- |
   | Type | `CNAME` |
   | Name / Host | `words` |
   | Target | `boa-newwords.pages.dev` |
   | TTL | 기본값 |

3. Cloudflare Custom domains가 **Active**인지, DNS 확인과 새 주소의 HTTPS 인증서가 정상인지 확인한다. 외부 DNS를 사용하는 하위 도메인은 전체 네임서버를 Cloudflare로 바꿀 필요가 없다. 대시보드에 먼저 연결하지 않고 CNAME만 추가하면 올바르게 서비스되지 않을 수 있다. [Cloudflare Pages 사용자 지정 하위 도메인 설정](https://developers.cloudflare.com/pages/configuration/custom-domains/)
4. 아래 인증·주소 의존성과 브라우저 항목을 확인한다. `@`, `www`, MX·TXT 등 무관한 이름과 기존 본사이트·네임서버는 유지한다. 인증서 검증 문제가 생겨도 무관한 DNS 레코드를 임의 삭제하지 않는다.

## 주소에 따라 달라질 수 있는 운영 의존성

실제 배포 소스와 운영 대시보드를 대조한 뒤 다음을 확인한다. 이번 문서가 다른 저장소의 코드 변경을 승인하거나 완료했다는 뜻은 아니다.

접근 가능한 후보 소스를 읽기 전용으로 점검했을 때 현재 origin을 기반으로 인증 이동 URL을 구성하는 코드와 출처별 브라우저 저장 의존성이 있었다. 점검한 소스에서는 고정 canonical·`og:url`이나 기존 `pages.dev` 문자열을 발견하지 않았고, 공유 이미지에는 별도 외부 절대 URL이 있었다. 실제 운영 배포와 같은 커밋인지는 대시보드에서 확인하지 못했으므로 이 결과를 운영 전체의 부재·완료 판정으로 확대하지 않는다. 다른 저장소의 파일은 수정하지 않았다.

- **인증·이메일 이동 주소:** Supabase를 운영 인증으로 사용하는 경우 Authentication → URL Configuration의 Site URL과 Redirect URLs를 확인한다. 새 대표 Site URL은 `https://words.haeonkorean.com`이며, 실제 로그인 흐름에서 사용하는 정확한 경로에 맞춰 `https://words.haeonkorean.com`, `https://words.haeonkorean.com/auth`, `https://words.haeonkorean.com/reset-password` 허용 여부를 확인한다. 기존 `.pages.dev`의 대응 URL은 전환 검증·롤백 기간에 유지한다. 이메일 템플릿이 Site URL 또는 RedirectTo 중 무엇을 쓰는지도 확인한다. 실제 허용 목록은 미확인이다. [Supabase Redirect URLs와 Site URL](https://supabase.com/docs/guides/auth/redirect-urls)
- **소셜 로그인:** 실제 사용하는 인증 중개 서비스·OAuth 제공자의 허용 도메인·리디렉션 URI에 새 주소가 필요한지 확인한다. 제공자 콜백 주소와 최종 사용자 이동 주소는 구분하며, 실제 값 확인 없이 일괄 변경하지 않는다.
- **로그인·프로필 저장:** 브라우저의 로그인 상태와 로컬 저장 정보는 출처가 바뀌면 자동 승계되지 않을 수 있다. 새 주소에서 다시 로그인하고 기존 서버 데이터가 보이는지 확인한다. 데이터 이전이나 삭제는 이번 작업에 포함하지 않는다.
- **외부 API·CORS:** 실제 호출되는 API와 요청 Origin을 개발자 도구에서 확인한다. 별도 허용 목록이 있다면 필요한 서비스에만 `https://words.haeonkorean.com`을 허용하고 전환 중 기존 Origin을 유지한다. 편의를 위한 `*` 변경은 하지 않는다. 해움 사이트용 Worker의 기존·새 Origin 허용과 어휘 서비스의 인증·API 허용은 별도다.
- **canonical·메타데이터·공유 URL:** 운영 HTML의 canonical, `og:url`, sitemap·robots와 공유 링크가 존재하는지 확인하고 새 대표 주소와 일치시키는 변경이 필요한지 판단한다. 실제 운영 HTML을 읽지 못했으므로 이 항목의 현재 값과 완료 여부는 미확인이다.
- **절대 자산 주소·직접 경로:** 이미지·CSS·JS의 절대 URL, 로그인 후 경로, 인쇄 화면과 새로고침이 새 도메인에서도 동작하는지 확인한다. `/words/`라는 하위 경로로 배포하는 작업이 아니며, 경로 변경을 자동으로 수반하지 않는다.

## 전체 전환과 PR 적용 순서

어휘 서비스의 Pages Custom domain 등록 → `words` CNAME → 어휘 새 주소의 DNS·HTTPS 및 인증 준비 → 해움 운영 Worker의 기존·새 출처 동시 허용 → 해움 GitHub Pages Custom domain → `haeum` CNAME → 두 새 주소의 실제 화면·기능·직접 경로 확인 → **사용자 확인 후 Draft PR #4 병합 시점 결정** 순서로 관리한다. 이번 점검은 어느 운영 단계나 병합도 실행하지 않는다. 어휘 주소가 아직 열리지 않는 동안에는 링크 코드 변경안이 준비되었더라도 운영에서 사용 가능하다고 보고하지 않는다.

`boa-newwords.pages.dev`가 새 주소로 자동 리디렉션된다고 가정하지 않는다. 필요하면 새 도메인이 정상 활성화된 뒤 Cloudflare의 별도 리디렉션 기능을 검토한다. 기존 주소 유지·리디렉션 변경은 별도 운영 결정이다. [Cloudflare `.pages.dev` 리디렉션 안내](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/)

## 적용 후 확인 명령과 브라우저 항목

아래 명령은 DNS와 GET/HEAD 읽기만 수행한다. 계정 생성·메일 발송·실제 학습 데이터 POST는 실행하지 않는다.

```powershell
Resolve-DnsName words.haeonkorean.com -Type CNAME
Resolve-DnsName words.haeonkorean.com -Type A
Resolve-DnsName words.haeonkorean.com -Type AAAA
curl.exe -I https://words.haeonkorean.com/
curl.exe -I http://words.haeonkorean.com/
curl.exe -I https://boa-newwords.pages.dev/
curl.exe -I https://words.haeonkorean.com/auth
curl.exe -I https://words.haeonkorean.com/reset-password
```

브라우저에서는 첫 화면·이미지·메뉴, 로그인과 로그아웃, 이메일 확인·비밀번호 재설정의 이동 주소, 기존 프로필·진도 조회, 받아쓰기 화면·인쇄, 직접 경로 진입·새로고침, 콘솔과 네트워크의 CORS·404·인증 오류를 확인한다. 데이터를 생성하거나 메일을 발송하는 테스트는 사용자가 의도한 테스트 계정·범위에서 별도로 진행한다. 인증서 발급 완료, Custom domain Active, 기존 주소와 새 주소의 실제 동작을 각각 기록한다.

되돌릴 때는 기록한 상태를 기준으로 이번에 추가한 `words` 레코드·Custom domain·인증 허용 URL만 복원한다. 기존 Pages 프로젝트나 Git 연결을 삭제하지 않는다. 해움 코드의 링크 복구가 필요하면 별도 검토·사용자 확인을 거쳐 반영한다.
