# URL 전환 목록과 경로 보존 검증

이 문서는 해움 사이트의 호스트를 `haeumkorean.me`에서 `haeum.haeonkorean.com`으로 바꿀 때 유지할 URL 구조를 기록한다. 아래 새 URL은 전환 목표이며 DNS·인증서·운영 배포 성공을 뜻하지 않는다. 해온 본사이트의 코드와 `haeonkorean.com`, `www.haeonkorean.com`은 변경 대상이 아니다.

조사 기준은 전환 전 main `c2e4d2c82e3a111fd98312088fc06a97605e7e0b`와 최초 PR 변경 `34b5a22f20ed72a8930795b004a4c90f2c68f633`이다. `src/` 전체, `index.html`, `public/` 전체, Vite 설정, `samples/`, KB 동기화 스크립트의 `href`, `src`, `fetch`, `window.location`, 해시, DOM ID, 절대 URL과 루트 상대 경로를 조사했다. 환경변수의 비밀 값은 읽거나 기록하지 않았다.

2026-10-27 최종 범위는 최신 main `486e8922`의 공지 디자인·온라인 학습 **개발 중** 화면을 유지한다. 공지의 잘못된 표시 주소와 href만 `haeum.haeonkorean.com`으로 바로잡고, PR의 앵커 초기 진입 보완·주소 설정·public 경로 보존을 적용한다. 어휘 사이트의 새 주소는 준비됐지만 홈의 어휘 버튼을 복구하지 않는다. `.me`는 별도 안내 페이지이며 아래 표는 옛 호스트의 모든 URL이 계속 응답하거나 리디렉션된다는 약속이 아니라 **새 해움 호스트에서 같은 경로를 보존하는 목록**이다.

## A. 앱 화면과 해시 경로

`src/App.tsx`는 `window.location.hash`를 해석한다. `/roa` 같은 서버 경로와 `/#/roa` 같은 해시 경로는 다르다. 기존 URL의 경로·쿼리·해시는 유지하고 호스트만 바꾼다. `/haeum/` 접두 경로는 추가하지 않는다.

| 용도 | 기존 URL | 목표 URL | 보존 기준 |
| --- | --- | --- | --- |
| 홈 기본 진입 | `https://haeumkorean.me/` | `https://haeum.haeonkorean.com/` | 해시가 없으면 홈 |
| 홈 명시 경로 | `https://haeumkorean.me/#/` | `https://haeum.haeonkorean.com/#/` | 홈 링크가 사용하는 해시 |
| 로아 준비 화면 | `https://haeumkorean.me/#/roa` | `https://haeum.haeonkorean.com/#/roa` | 홈 아이콘의 `window.location.hash` 이동 |
| 로아 이전 링크 호환 | `https://haeumkorean.me/#/loading` | `https://haeum.haeonkorean.com/#/loading` | 기존 alias 유지 |
| 교육·시험 안내 | `https://haeumkorean.me/#/education-exam` | `https://haeum.haeonkorean.com/#/education-exam` | 교육 화면과 홈 왕복 |
| 빌드 HTML 파일 | `https://haeumkorean.me/index.html` | `https://haeum.haeonkorean.com/index.html` | `/` 진입 파일과 동일 빌드 |

현재 코드는 알 수 없는 해시를 홈 화면으로 처리한다. 임의의 서버 경로에 대한 Pages 재작성 규칙이나 `404.html`은 없다. 따라서 이번 전환으로 `/education-exam` 같은 서버 경로 지원을 새로 약속하지 않는다. 쿼리는 라우터가 직접 읽지 않으며, 외부에서 보관한 쿼리를 삭제·재작성하는 코드는 추가하지 않는다.

## B. 섹션 앵커와 DOM ID

| 용도 | 기존 URL | 목표 URL | 정적 점검 |
| --- | --- | --- | --- |
| 소개 | `https://haeumkorean.me/#about` | `https://haeum.haeonkorean.com/#about` | 홈의 `href="#about"`와 `id="about"` 존재 |
| 프로그램 | `https://haeumkorean.me/#programs` | `https://haeum.haeonkorean.com/#programs` | 홈의 링크와 ID 존재 |
| 온라인 학습 | `https://haeumkorean.me/#online-learning` | `https://haeum.haeonkorean.com/#online-learning` | 홈의 링크와 ID 존재 |
| 문의 | `https://haeumkorean.me/#contact` | `https://haeum.haeonkorean.com/#contact` | 홈의 링크와 ID 존재 |
| 교육 화면 상담 섹션 | 교육 화면에서 `#lead` 클릭 → `https://haeumkorean.me/#lead` | 같은 동작의 `https://haeum.haeonkorean.com/#lead` | **기존 라우터 충돌: 보존 대상으로 기록하되 정상 이동으로 판정하지 않음** |

기존 운영 사이트에서도 `/#programs`를 새 탭으로 직접 열면 React가 섹션을 렌더링하기 전에 브라우저의 초기 앵커 이동이 끝나 섹션으로 이동하지 않는 경우를 확인했다. 이 전환안은 기존 네 앵커의 문자열과 ID를 유지하면서, 홈의 mount 및 `hashchange` 때 해당 섹션이 렌더링된 뒤 `scrollIntoView`를 실행하도록 보완한다. URL을 새 형식으로 바꾸는 수정은 아니다. 최종 브라우저 결과는 별도 검증 보고서에 기록한다.

`EducationExam.tsx`에는 `id="lead"`가 있지만, 그 화면에서 `href="#lead"`를 클릭하면 앱 라우터가 해시를 `lead`로 읽어 홈으로 전환한다. 이는 도메인 변경 전부터 존재한 동작이다. `/#/education-exam#lead` 같은 복합 해시는 라우터가 지원하지 않는다. 이번 주소 변경에서 이를 임의로 고치거나 새 정상 경로로 기재하지 않는다. 홈 앵커의 실제 스크롤과 화면 진입은 브라우저에서 별도로 확인한다.

상담 폼의 `lead-name`, `lead-contact`, `lead-inquiry`, `lead-note`는 label·입력 연결용 DOM ID이다. `index.html`의 `root`는 React 마운트 ID이고, Modal의 동적 `titleId`는 접근성 연결용이다. 이 ID들은 별도 앱 화면이나 지원되는 공유 경로를 만들지 않는다.

## C. public 전체 파일: 기존 → 목표 URL

현재 `public/`에는 **41개 파일**이 있다. 아래 목록은 디렉터리를 제외한 모든 파일을 포함한다. 각 행은 같은 경로의 기존 호스트 URL → 새 호스트 URL 대응이다. 링크의 URL은 UTF-8 퍼센트 인코딩을 사용하며 표시 경로는 원래 한국어·대소문자·구두점을 그대로 유지한다. 현재 이름에 공백은 없지만 검증기는 공백과 한국어를 경로 구간별로 인코딩한다. 임의 소문자화, 슬러그 변경, 파일명 정리는 하지 않는다.

`/CNAME`은 Pages 호스트 메타데이터이고 `/assets/.gitkeep`은 빈 디렉터리 보존 파일이다. 두 파일도 빌드 복사를 검사하지만 방문자 화면이나 공개 HTTP 성공 필수 항목으로 취급하지 않는다. GitHub Actions 방식에서 CNAME 파일만으로 실제 Pages Custom domain을 변경할 수는 없다.

| 정확한 경로 | 기존 URL | 목표 URL | 분류·의존 |
| --- | --- | --- | --- |
| `/CNAME` | [기존](https://haeumkorean.me/CNAME) | [목표](https://haeum.haeonkorean.com/CNAME) | 배포 메타데이터 |
| `/assets/.gitkeep` | [기존](https://haeumkorean.me/assets/.gitkeep) | [목표](https://haeum.haeonkorean.com/assets/.gitkeep) | 빈 디렉터리 보존 파일 |
| `/assets/0011.jpg` | [기존](https://haeumkorean.me/assets/0011.jpg) | [목표](https://haeum.haeonkorean.com/assets/0011.jpg) | 정적 이미지 |
| `/assets/0021.jpg` | [기존](https://haeumkorean.me/assets/0021.jpg) | [목표](https://haeum.haeonkorean.com/assets/0021.jpg) | 정적 이미지 |
| `/assets/haeum-favicon.svg` | [기존](https://haeumkorean.me/assets/haeum-favicon.svg) | [목표](https://haeum.haeonkorean.com/assets/haeum-favicon.svg) | 정적 이미지 |
| `/assets/kb/01ae703e6a15.jpg` | [기존](https://haeumkorean.me/assets/kb/01ae703e6a15.jpg) | [목표](https://haeum.haeonkorean.com/assets/kb/01ae703e6a15.jpg) | 정적 이미지 |
| `/assets/kb/1dde435f907c.jpg` | [기존](https://haeumkorean.me/assets/kb/1dde435f907c.jpg) | [목표](https://haeum.haeonkorean.com/assets/kb/1dde435f907c.jpg) | 정적 이미지 |
| `/assets/kb/2786bad6d06d.jpg` | [기존](https://haeumkorean.me/assets/kb/2786bad6d06d.jpg) | [목표](https://haeum.haeonkorean.com/assets/kb/2786bad6d06d.jpg) | 정적 이미지 |
| `/assets/kb/4e9540eeaf50.jpg` | [기존](https://haeumkorean.me/assets/kb/4e9540eeaf50.jpg) | [목표](https://haeum.haeonkorean.com/assets/kb/4e9540eeaf50.jpg) | 정적 이미지 |
| `/assets/kb/b262e88c35c9.jpg` | [기존](https://haeumkorean.me/assets/kb/b262e88c35c9.jpg) | [목표](https://haeum.haeonkorean.com/assets/kb/b262e88c35c9.jpg) | 정적 이미지 |
| `/assets/kb/d555c1f44a0e.jpg` | [기존](https://haeumkorean.me/assets/kb/d555c1f44a0e.jpg) | [목표](https://haeum.haeonkorean.com/assets/kb/d555c1f44a0e.jpg) | 정적 이미지 |
| `/favicon.svg` | [기존](https://haeumkorean.me/favicon.svg) | [목표](https://haeum.haeonkorean.com/favicon.svg) | 정적 이미지 |
| `/icons/blog.png` | [기존](https://haeumkorean.me/icons/blog.png) | [목표](https://haeum.haeonkorean.com/icons/blog.png) | 정적 이미지 |
| `/icons/place.png` | [기존](https://haeumkorean.me/icons/place.png) | [목표](https://haeum.haeonkorean.com/icons/place.png) | 정적 이미지 |
| `/icons/talktalk.png` | [기존](https://haeumkorean.me/icons/talktalk.png) | [목표](https://haeum.haeonkorean.com/icons/talktalk.png) | 정적 이미지 |
| `/kb/about.md` | [기존](https://haeumkorean.me/kb/about.md) | [목표](https://haeum.haeonkorean.com/kb/about.md) | KB manifest 문서 |
| `/kb/blog-clean.txt` | [기존](https://haeumkorean.me/kb/blog-clean.txt) | [목표](https://haeum.haeonkorean.com/kb/blog-clean.txt) | KB manifest 문서 |
| `/kb/blog-original-materials.txt` | [기존](https://haeumkorean.me/kb/blog-original-materials.txt) | [목표](https://haeum.haeonkorean.com/kb/blog-original-materials.txt) | 원본 보관 문서 |
| `/kb/blog/2025-10-16-다른-언어-습득하기언어학습-사고방식의-차이.md` | [기존](https://haeumkorean.me/kb/blog/2025-10-16-%EB%8B%A4%EB%A5%B8-%EC%96%B8%EC%96%B4-%EC%8A%B5%EB%93%9D%ED%95%98%EA%B8%B0%EC%96%B8%EC%96%B4%ED%95%99%EC%8A%B5-%EC%82%AC%EA%B3%A0%EB%B0%A9%EC%8B%9D%EC%9D%98-%EC%B0%A8%EC%9D%B4.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-10-16-%EB%8B%A4%EB%A5%B8-%EC%96%B8%EC%96%B4-%EC%8A%B5%EB%93%9D%ED%95%98%EA%B8%B0%EC%96%B8%EC%96%B4%ED%95%99%EC%8A%B5-%EC%82%AC%EA%B3%A0%EB%B0%A9%EC%8B%9D%EC%9D%98-%EC%B0%A8%EC%9D%B4.md) | KB manifest 문서 |
| `/kb/blog/2025-10-18-토픽이-너무-어려워요.md` | [기존](https://haeumkorean.me/kb/blog/2025-10-18-%ED%86%A0%ED%94%BD%EC%9D%B4-%EB%84%88%EB%AC%B4-%EC%96%B4%EB%A0%A4%EC%9B%8C%EC%9A%94.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-10-18-%ED%86%A0%ED%94%BD%EC%9D%B4-%EB%84%88%EB%AC%B4-%EC%96%B4%EB%A0%A4%EC%9B%8C%EC%9A%94.md) | KB manifest 문서 |
| `/kb/blog/2025-10-19-한국어-교원-교육에-필요한-것.md` | [기존](https://haeumkorean.me/kb/blog/2025-10-19-%ED%95%9C%EA%B5%AD%EC%96%B4-%EA%B5%90%EC%9B%90-%EA%B5%90%EC%9C%A1%EC%97%90-%ED%95%84%EC%9A%94%ED%95%9C-%EA%B2%83.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-10-19-%ED%95%9C%EA%B5%AD%EC%96%B4-%EA%B5%90%EC%9B%90-%EA%B5%90%EC%9C%A1%EC%97%90-%ED%95%84%EC%9A%94%ED%95%9C-%EA%B2%83.md) | KB manifest 문서 |
| `/kb/blog/2025-10-23-고대의-지혜.md` | [기존](https://haeumkorean.me/kb/blog/2025-10-23-%EA%B3%A0%EB%8C%80%EC%9D%98-%EC%A7%80%ED%98%9C.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-10-23-%EA%B3%A0%EB%8C%80%EC%9D%98-%EC%A7%80%ED%98%9C.md) | KB manifest 문서 |
| `/kb/blog/2025-10-29-토픽-topik-2-시험-대비11월-16일-응시일.md` | [기존](https://haeumkorean.me/kb/blog/2025-10-29-%ED%86%A0%ED%94%BD-topik-2-%EC%8B%9C%ED%97%98-%EB%8C%80%EB%B9%8411%EC%9B%94-16%EC%9D%BC-%EC%9D%91%EC%8B%9C%EC%9D%BC.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-10-29-%ED%86%A0%ED%94%BD-topik-2-%EC%8B%9C%ED%97%98-%EB%8C%80%EB%B9%8411%EC%9B%94-16%EC%9D%BC-%EC%9D%91%EC%8B%9C%EC%9D%BC.md) | KB manifest 문서 |
| `/kb/blog/2025-11-14-박영사-도서검토-의견.md` | [기존](https://haeumkorean.me/kb/blog/2025-11-14-%EB%B0%95%EC%98%81%EC%82%AC-%EB%8F%84%EC%84%9C%EA%B2%80%ED%86%A0-%EC%9D%98%EA%B2%AC.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-11-14-%EB%B0%95%EC%98%81%EC%82%AC-%EB%8F%84%EC%84%9C%EA%B2%80%ED%86%A0-%EC%9D%98%EA%B2%AC.md) | KB manifest 문서 |
| `/kb/blog/2025-11-22-사회-비평-알고리즘적-아부와-줏대-없는-사회의-도래.md` | [기존](https://haeumkorean.me/kb/blog/2025-11-22-%EC%82%AC%ED%9A%8C-%EB%B9%84%ED%8F%89-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98%EC%A0%81-%EC%95%84%EB%B6%80%EC%99%80-%EC%A4%8F%EB%8C%80-%EC%97%86%EB%8A%94-%EC%82%AC%ED%9A%8C%EC%9D%98-%EB%8F%84%EB%9E%98.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-11-22-%EC%82%AC%ED%9A%8C-%EB%B9%84%ED%8F%89-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98%EC%A0%81-%EC%95%84%EB%B6%80%EC%99%80-%EC%A4%8F%EB%8C%80-%EC%97%86%EB%8A%94-%EC%82%AC%ED%9A%8C%EC%9D%98-%EB%8F%84%EB%9E%98.md) | KB manifest 문서 |
| `/kb/blog/2025-11-22-시대-선언-알고리즘의-아부를-넘어-인간의-품격으로.md` | [기존](https://haeumkorean.me/kb/blog/2025-11-22-%EC%8B%9C%EB%8C%80-%EC%84%A0%EC%96%B8-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98%EC%9D%98-%EC%95%84%EB%B6%80%EB%A5%BC-%EB%84%98%EC%96%B4-%EC%9D%B8%EA%B0%84%EC%9D%98-%ED%92%88%EA%B2%A9%EC%9C%BC%EB%A1%9C.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-11-22-%EC%8B%9C%EB%8C%80-%EC%84%A0%EC%96%B8-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98%EC%9D%98-%EC%95%84%EB%B6%80%EB%A5%BC-%EB%84%98%EC%96%B4-%EC%9D%B8%EA%B0%84%EC%9D%98-%ED%92%88%EA%B2%A9%EC%9C%BC%EB%A1%9C.md) | KB manifest 문서 |
| `/kb/blog/2025-11-24-수업-근황수강생의-문화-이해하기.md` | [기존](https://haeumkorean.me/kb/blog/2025-11-24-%EC%88%98%EC%97%85-%EA%B7%BC%ED%99%A9%EC%88%98%EA%B0%95%EC%83%9D%EC%9D%98-%EB%AC%B8%ED%99%94-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-11-24-%EC%88%98%EC%97%85-%EA%B7%BC%ED%99%A9%EC%88%98%EA%B0%95%EC%83%9D%EC%9D%98-%EB%AC%B8%ED%99%94-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0.md) | KB manifest 문서 |
| `/kb/blog/2025-11-28-문자의-역사와-한국어의-미학.md` | [기존](https://haeumkorean.me/kb/blog/2025-11-28-%EB%AC%B8%EC%9E%90%EC%9D%98-%EC%97%AD%EC%82%AC%EC%99%80-%ED%95%9C%EA%B5%AD%EC%96%B4%EC%9D%98-%EB%AF%B8%ED%95%99.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-11-28-%EB%AC%B8%EC%9E%90%EC%9D%98-%EC%97%AD%EC%82%AC%EC%99%80-%ED%95%9C%EA%B5%AD%EC%96%B4%EC%9D%98-%EB%AF%B8%ED%95%99.md) | KB manifest 문서 |
| `/kb/blog/2025-11-28-왜-한국어는-원어민에게-배워야-할까-과학적-근거-6가지.md` | [기존](https://haeumkorean.me/kb/blog/2025-11-28-%EC%99%9C-%ED%95%9C%EA%B5%AD%EC%96%B4%EB%8A%94-%EC%9B%90%EC%96%B4%EB%AF%BC%EC%97%90%EA%B2%8C-%EB%B0%B0%EC%9B%8C%EC%95%BC-%ED%95%A0%EA%B9%8C-%EA%B3%BC%ED%95%99%EC%A0%81-%EA%B7%BC%EA%B1%B0-6%EA%B0%80%EC%A7%80.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-11-28-%EC%99%9C-%ED%95%9C%EA%B5%AD%EC%96%B4%EB%8A%94-%EC%9B%90%EC%96%B4%EB%AF%BC%EC%97%90%EA%B2%8C-%EB%B0%B0%EC%9B%8C%EC%95%BC-%ED%95%A0%EA%B9%8C-%EA%B3%BC%ED%95%99%EC%A0%81-%EA%B7%BC%EA%B1%B0-6%EA%B0%80%EC%A7%80.md) | KB manifest 문서 |
| `/kb/blog/2025-11-28-한국어-교육-방법론-직접-교수법-vs-이중언어-접근법.md` | [기존](https://haeumkorean.me/kb/blog/2025-11-28-%ED%95%9C%EA%B5%AD%EC%96%B4-%EA%B5%90%EC%9C%A1-%EB%B0%A9%EB%B2%95%EB%A1%A0-%EC%A7%81%EC%A0%91-%EA%B5%90%EC%88%98%EB%B2%95-vs-%EC%9D%B4%EC%A4%91%EC%96%B8%EC%96%B4-%EC%A0%91%EA%B7%BC%EB%B2%95.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-11-28-%ED%95%9C%EA%B5%AD%EC%96%B4-%EA%B5%90%EC%9C%A1-%EB%B0%A9%EB%B2%95%EB%A1%A0-%EC%A7%81%EC%A0%91-%EA%B5%90%EC%88%98%EB%B2%95-vs-%EC%9D%B4%EC%A4%91%EC%96%B8%EC%96%B4-%EC%A0%91%EA%B7%BC%EB%B2%95.md) | KB manifest 문서 |
| `/kb/blog/2025-12-01-토픽topik-2-쓰기-첨삭.md` | [기존](https://haeumkorean.me/kb/blog/2025-12-01-%ED%86%A0%ED%94%BDtopik-2-%EC%93%B0%EA%B8%B0-%EC%B2%A8%EC%82%AD.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-12-01-%ED%86%A0%ED%94%BDtopik-2-%EC%93%B0%EA%B8%B0-%EC%B2%A8%EC%82%AD.md) | KB manifest 문서 |
| `/kb/blog/2025-12-09-구글-클래스룸-수업게시판으로-활용하기.md` | [기존](https://haeumkorean.me/kb/blog/2025-12-09-%EA%B5%AC%EA%B8%80-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%A3%B8-%EC%88%98%EC%97%85%EA%B2%8C%EC%8B%9C%ED%8C%90%EC%9C%BC%EB%A1%9C-%ED%99%9C%EC%9A%A9%ED%95%98%EA%B8%B0.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-12-09-%EA%B5%AC%EA%B8%80-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%A3%B8-%EC%88%98%EC%97%85%EA%B2%8C%EC%8B%9C%ED%8C%90%EC%9C%BC%EB%A1%9C-%ED%99%9C%EC%9A%A9%ED%95%98%EA%B8%B0.md) | KB manifest 문서 |
| `/kb/blog/2025-12-09-사회통합프로그램kiip을-통한-한국어-학습의-한계-및-부작용에-관한-종합-보고서.md` | [기존](https://haeumkorean.me/kb/blog/2025-12-09-%EC%82%AC%ED%9A%8C%ED%86%B5%ED%95%A9%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8kiip%EC%9D%84-%ED%86%B5%ED%95%9C-%ED%95%9C%EA%B5%AD%EC%96%B4-%ED%95%99%EC%8A%B5%EC%9D%98-%ED%95%9C%EA%B3%84-%EB%B0%8F-%EB%B6%80%EC%9E%91%EC%9A%A9%EC%97%90-%EA%B4%80%ED%95%9C-%EC%A2%85%ED%95%A9-%EB%B3%B4%EA%B3%A0%EC%84%9C.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-12-09-%EC%82%AC%ED%9A%8C%ED%86%B5%ED%95%A9%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8kiip%EC%9D%84-%ED%86%B5%ED%95%9C-%ED%95%9C%EA%B5%AD%EC%96%B4-%ED%95%99%EC%8A%B5%EC%9D%98-%ED%95%9C%EA%B3%84-%EB%B0%8F-%EB%B6%80%EC%9E%91%EC%9A%A9%EC%97%90-%EA%B4%80%ED%95%9C-%EC%A2%85%ED%95%A9-%EB%B3%B4%EA%B3%A0%EC%84%9C.md) | KB manifest 문서 |
| `/kb/blog/2025-12-09-시원스쿨-교재-검토.md` | [기존](https://haeumkorean.me/kb/blog/2025-12-09-%EC%8B%9C%EC%9B%90%EC%8A%A4%EC%BF%A8-%EA%B5%90%EC%9E%AC-%EA%B2%80%ED%86%A0.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-12-09-%EC%8B%9C%EC%9B%90%EC%8A%A4%EC%BF%A8-%EA%B5%90%EC%9E%AC-%EA%B2%80%ED%86%A0.md) | KB manifest 문서 |
| `/kb/blog/2025-12-12-한국어-교육의-새로운-비전-문화-독해력으로의-전환.md` | [기존](https://haeumkorean.me/kb/blog/2025-12-12-%ED%95%9C%EA%B5%AD%EC%96%B4-%EA%B5%90%EC%9C%A1%EC%9D%98-%EC%83%88%EB%A1%9C%EC%9A%B4-%EB%B9%84%EC%A0%84-%EB%AC%B8%ED%99%94-%EB%8F%85%ED%95%B4%EB%A0%A5%EC%9C%BC%EB%A1%9C%EC%9D%98-%EC%A0%84%ED%99%98.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-12-12-%ED%95%9C%EA%B5%AD%EC%96%B4-%EA%B5%90%EC%9C%A1%EC%9D%98-%EC%83%88%EB%A1%9C%EC%9A%B4-%EB%B9%84%EC%A0%84-%EB%AC%B8%ED%99%94-%EB%8F%85%ED%95%B4%EB%A0%A5%EC%9C%BC%EB%A1%9C%EC%9D%98-%EC%A0%84%ED%99%98.md) | KB manifest 문서 |
| `/kb/blog/2025-12-12-한국인이-나이를-묻는-진짜-이유.md` | [기존](https://haeumkorean.me/kb/blog/2025-12-12-%ED%95%9C%EA%B5%AD%EC%9D%B8%EC%9D%B4-%EB%82%98%EC%9D%B4%EB%A5%BC-%EB%AC%BB%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-12-12-%ED%95%9C%EA%B5%AD%EC%9D%B8%EC%9D%B4-%EB%82%98%EC%9D%B4%EB%A5%BC-%EB%AC%BB%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0.md) | KB manifest 문서 |
| `/kb/blog/2025-12-15-일년을-돌아보며.md` | [기존](https://haeumkorean.me/kb/blog/2025-12-15-%EC%9D%BC%EB%85%84%EC%9D%84-%EB%8F%8C%EC%95%84%EB%B3%B4%EB%A9%B0.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-12-15-%EC%9D%BC%EB%85%84%EC%9D%84-%EB%8F%8C%EC%95%84%EB%B3%B4%EB%A9%B0.md) | KB manifest 문서 |
| `/kb/blog/2025-12-16-국제고-외고-진로-외국어-중점-학교.md` | [기존](https://haeumkorean.me/kb/blog/2025-12-16-%EA%B5%AD%EC%A0%9C%EA%B3%A0-%EC%99%B8%EA%B3%A0-%EC%A7%84%EB%A1%9C-%EC%99%B8%EA%B5%AD%EC%96%B4-%EC%A4%91%EC%A0%90-%ED%95%99%EA%B5%90.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-12-16-%EA%B5%AD%EC%A0%9C%EA%B3%A0-%EC%99%B8%EA%B3%A0-%EC%A7%84%EB%A1%9C-%EC%99%B8%EA%B5%AD%EC%96%B4-%EC%A4%91%EC%A0%90-%ED%95%99%EA%B5%90.md) | KB manifest 문서 |
| `/kb/blog/2025-12-21-문화적-동질화-언어-사멸-포식-문화-말살.md` | [기존](https://haeumkorean.me/kb/blog/2025-12-21-%EB%AC%B8%ED%99%94%EC%A0%81-%EB%8F%99%EC%A7%88%ED%99%94-%EC%96%B8%EC%96%B4-%EC%82%AC%EB%A9%B8-%ED%8F%AC%EC%8B%9D-%EB%AC%B8%ED%99%94-%EB%A7%90%EC%82%B4.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-12-21-%EB%AC%B8%ED%99%94%EC%A0%81-%EB%8F%99%EC%A7%88%ED%99%94-%EC%96%B8%EC%96%B4-%EC%82%AC%EB%A9%B8-%ED%8F%AC%EC%8B%9D-%EB%AC%B8%ED%99%94-%EB%A7%90%EC%82%B4.md) | KB manifest 문서 |
| `/kb/blog/2025-12-22-문화적-동질화에-관한-보고서.md` | [기존](https://haeumkorean.me/kb/blog/2025-12-22-%EB%AC%B8%ED%99%94%EC%A0%81-%EB%8F%99%EC%A7%88%ED%99%94%EC%97%90-%EA%B4%80%ED%95%9C-%EB%B3%B4%EA%B3%A0%EC%84%9C.md) | [목표](https://haeum.haeonkorean.com/kb/blog/2025-12-22-%EB%AC%B8%ED%99%94%EC%A0%81-%EB%8F%99%EC%A7%88%ED%99%94%EC%97%90-%EA%B4%80%ED%95%9C-%EB%B3%B4%EA%B3%A0%EC%84%9C.md) | KB manifest 문서 |
| `/kb/manifest.json` | [기존](https://haeumkorean.me/kb/manifest.json) | [목표](https://haeum.haeonkorean.com/kb/manifest.json) | KB 문서 목록 |

## D. 지식 문서와 이미지 의존 관계

`src/lib/docsearch.ts`는 `/kb/manifest.json`을 가져온 뒤 각 항목의 `url`을 가져온다. manifest는 **24개**의 루트 상대 URL을 가진다: 블로그 Markdown 22개, `/kb/about.md`, `/kb/blog-clean.txt`. 위 표에 24개를 모두 표시했다. `/kb/blog-original-materials.txt`는 manifest에서 읽지 않지만 public 파일이므로 경로와 내용 보존 대상이다.

Markdown에서 사용하는 로컬 이미지 연결은 다음 **6개**이다. 해당 문서와 이미지의 파일명을 함께 보존해야 한다.

| Markdown 문서 경로 | 이미지 경로 |
| --- | --- |
| `/kb/blog/2025-10-29-토픽-topik-2-시험-대비11월-16일-응시일.md` | `/assets/kb/01ae703e6a15.jpg` |
| `/kb/blog/2025-11-14-박영사-도서검토-의견.md` | `/assets/kb/1dde435f907c.jpg` |
| `/kb/blog/2025-11-24-수업-근황수강생의-문화-이해하기.md` | `/assets/kb/d555c1f44a0e.jpg` |
| `/kb/blog/2025-12-01-토픽topik-2-쓰기-첨삭.md` | `/assets/kb/2786bad6d06d.jpg` |
| `/kb/blog/2025-12-09-구글-클래스룸-수업게시판으로-활용하기.md` | `/assets/kb/4e9540eeaf50.jpg` |
| `/kb/blog/2025-12-09-시원스쿨-교재-검토.md` | `/assets/kb/b262e88c35c9.jpg` |

manifest의 `external_url`은 원래 네이버 게시물 출처이며 새 홈페이지 호스트로 바꾸지 않는다. 과거 블로그 원문·정제문과 개별 글의 외부 링크도 보존한다. 검증 스크립트는 전환 전 파일 내용과 비교하되 `/kb/about.md`의 홈페이지 주소와 `/CNAME`의 호스트 문자열 변경만 허용한다.

## E. 빌드에서 생기는 URL

| 경로 | 처리 |
| --- | --- |
| `/index.html` 및 `/` | Vite 빌드 진입 파일. HTML이 참조하는 생성 JS·CSS·favicon의 존재를 검사한다. |
| `/assets/index-<contenthash>.js` | 현재 HTML이 가리키는 JS를 검사한다. 소스 변경 시 해시가 달라지므로 옛 해시 파일명 자체의 영구 보존을 요구하지 않는다. |
| `/assets/index-<contenthash>.css` | 현재 HTML의 CSS 참조를 검사한다. URL의 루트 `/assets/` 구조를 유지한다. |
| `/assets/index-<contenthash>.js.map` | 현재 JS의 `sourceMappingURL`이 있으면 대응 파일 존재를 검사한다. |
| `/src/main.tsx` | 개발용 `index.html`의 진입 경로. 배포 HTML에는 생성 JS 경로로 치환되어야 하며 public URL 보존 대상이 아니다. |

Vite `base`는 미지정 상태인 기본 `/`를 유지한다. public의 `/assets/*.jpg`, `/assets/kb/*`, `/icons/*`, `/favicon.svg`와 생성 번들은 모두 새 호스트의 루트에서 로드한다. canonical, `og:url`, sitemap, robots.txt는 현재 저장소에 없으며 이번 변경으로 새로 추가하지 않았다.

## F. 외부 링크와 API 대응표

| 용도·근거 | 기존 값 | 목표 값 | 처리 |
| --- | --- | --- | --- |
| 대표 홈페이지: facts, about, README, CNAME | `https://haeumkorean.me` | `https://haeum.haeonkorean.com` | 홈페이지 호스트만 변경 |
| 별도 어휘 서비스 주소 | `https://boa-newwords.pages.dev` | `https://words.haeonkorean.com` | 기존 Pages 유지. 10월 27일 사용자 결정에 따라 해움 홈은 개발 중으로 유지하며 해당 버튼은 노출하지 않음 |
| 네이버 톡톡 | `https://talk.naver.com/W7AQRM9` | 동일 | 상담 채널 보존 |
| 네이버 스마트플레이스 | `https://m.place.naver.com/place/1283919586/home` | 동일 | 장소·예약 채널 보존 |
| 네이버 블로그 | `https://blog.naver.com/haeumkorean` | 동일 | 블로그 보존 |
| Instagram | `https://www.instagram.com/haeumkorean/` | 동일 | 계정 링크 보존 |
| 전화 | `tel:050713862171` | 동일 | `CONTACT.PHONE`에서 하이픈을 제거해 링크 생성 |
| 답변 API | `https://sweet-bird-16a2.jasujung404.workers.dev/api/answer` | 동일 | API 호스트를 홈페이지 호스트로 바꾸지 않음. 새 Origin의 운영 CORS 허용은 별도 |
| 소식 구독 API | `https://sweet-bird-16a2.jasujung404.workers.dev/api/subscribe` | 동일 | POST 구독 API. 실제 데이터 제출 없이 사전 요청과 로컬 mock을 구분해 검증 |
| 상담 접수 API | 기본 `null` | 동일 | `VITE_LEAD_API_URL` 또는 `window.__LEAD_API__`가 있을 때 사용. 현재 기본 미설정은 기존 상태 |
| 글꼴 CSS | `https://fonts.googleapis.com/css2?family=Gamja+Flower&family=Gowun+Dodum&display=swap` | 동일 | Google Fonts 외부 의존 유지 |
| 글꼴 연결 힌트 | `https://fonts.googleapis.com`, `https://fonts.gstatic.com` | 동일 | preconnect 유지 |
| KB 수집 RSS | `https://rss.blog.naver.com/haeumkorean.xml` | 동일 | `.github/workflows/kb-sync.yml`, 수집 스크립트의 입력 주소 보존 |
| Worker의 Notion·Upstage API | `https://api.notion.com/v1/...`, `https://api.upstage.ai/v1/solar/chat/completions` | 동일 | 샘플 서버 코드의 외부 서비스. 브라우저 홈페이지 주소가 아니며 비밀 값은 기록하지 않음 |

`src/lib/config.ts`는 Vite 환경변수 → `window` 런타임 값 → 기본값 순서로 API 주소를 선택한다. `index.html`은 답변 API를 지정하고, 구독 API에는 config 기본값이 있다. 상담·예약 버튼을 임의의 새 홈페이지 경로로 옮기지 않는다. DocBot의 답변 URL·전화번호와 법률 안내 본문 URL은 동적으로 링크가 되며 별도 사이트 경로를 생성하지 않는다. 교육 화면 헤더의 기존 ‘문의’ 링크는 `#/`로 홈에 돌아가는 동작이다. 별도 자체 공유 API나 `navigator.share` 경로는 없다. SVG의 `http://www.w3.org/2000/svg` 및 Inkscape XML namespace는 자산 다운로드·외부 이동 URL이 아니다.

Worker의 전환 allowlist 예시는 `https://haeumkorean.me,https://haeum.haeonkorean.com`이다. 여기에 있는 기존 `.me`는 전환 기간 출처 허용과 되돌리기 용도이므로 홈페이지 링크처럼 일괄 삭제하지 않는다. 샘플 파일 변경과 실제 Cloudflare 배포·환경변수 변경은 별개이며 실제 배포 소스는 운영 응답만으로 특정할 수 없다.

## G. 배포 URL이 없는 소스와 샘플

`samples/sample_claude.html`과 `samples/sample_gpt.tsx`는 `public/`에 없고 앱 진입점에서 import되지 않는다. 따라서 `/samples/sample_claude.html` 같은 배포 URL을 새로 만들거나 보존해야 할 페이지로 기재하지 않는다. 샘플의 `#philosophy`, `#community`, `#programs`, `#contact`, `href="#"` 예약 예시는 실제 홈의 URL 구조와 구분한다. `src/components/HelpBot.tsx`도 별도 라우트를 만들지 않는다.

저장소 루트의 `CNAME`, README, docs, `.github/`, Worker 샘플과 KB 수집 스크립트는 GitHub 소스 파일이다. Pages 배포 대상은 `dist`이며 이 파일들이 같은 경로로 모두 게시된다고 가정하지 않는다.

## H. 재현 가능한 보존 검증

Node 20에서 의존성을 설치하고 빌드한 뒤 다음을 실행한다. package.json·lockfile·배포 workflow는 변경하지 않는다.

```sh
npm ci
npm run build
node scripts/verify-url-inventory.mjs
```

검증기는 전환 전 commit과 public 파일 목록·대소문자·기존 내용 및 manifest URL을 비교하고, 41개 public 파일의 `dist` 복사 내용, manifest 24개 문서, Markdown 이미지 6개, 소스의 정적 자산 URL, 해시 route alias, 홈 앵커, 빌드 HTML·JS·CSS·source map 의존을 확인한다. 이 검사는 파일이 없어도 SPA fallback HTML이 200으로 반환되는 경우를 단순 성공 처리하지 않는다.

현재 로컬 정적 검사는 `PASS`였다: public 41개, manifest 24개, 로컬 KB 이미지 6개, 소스 정적 자산 참조 5개와 기존 해시 case 목록을 보존했다. 10월 24일 후속 HTTP 검증에서도 43개 URL과 실제 KB 로더 GET 25건·24문서 인덱스·검색이 통과했다. 브라우저의 4개 화면·4개 앵커 결과는 [검증 기록](domain-migration-validation.md)에 구분해 기록했다. 생성 번들 해시는 빌드마다 결과에 출력하며 로컬 결과가 새 도메인의 운영 성공을 뜻하지 않는다.

로컬 preview 또는 운영 전환 후 선택적으로 같은 스크립트에 호스트를 전달할 수 있다. 다음 옵션은 GET만 수행하며 API POST를 보내지 않는다.

```sh
node scripts/verify-url-inventory.mjs --base-url http://127.0.0.1:4173
node scripts/verify-url-inventory.mjs --base-url https://haeum.haeonkorean.com
```

HTTP 검사는 현재 빌드의 `/`·`/index.html`·생성 JS/CSS와 방문자용 public 파일을 200 응답 및 실제 파일 내용으로 확인한다. 이어 실제 `src/lib/docsearch.ts`를 TypeScript로 메모리에서 변환해 앱의 `buildIndex()`와 `search()`를 실행한다. 이때 fetch는 지정 호스트의 manifest와 24개 문서만 읽게 제한하며, 총 25건의 200 응답·24문서의 인덱스 포함·비어 있지 않은 검색 결과를 확인한다. 검색 로직을 검증기에 복제하거나 AI API·구독 API에 POST하지 않는다.

`/CNAME`, `/assets/.gitkeep`은 HTTP 검사에서 제외한다. 운영 호스트가 아직 이전 빌드를 제공하면 해시나 내용 차이로 실패할 수 있으므로 의도한 버전 적용 뒤 사용한다. 이 옵션은 현재 dist와 일치하는 호스트용이며 아직 전환하지 않은 `.me`의 과거 빌드를 동일 내용으로 판정하는 모드가 아니다. 로컬 HTTP 성공으로 DNS·HTTPS·계정 도메인 검증·운영 CORS나 외부 예약 접수 성공을 판정하지 않는다. 해시는 서버 요청에 전달되지 않으므로 A·B의 화면 전환·뒤로가기·앵커 스크롤, 특히 기존 `#lead` 충돌은 브라우저 점검 결과를 별도로 남긴다.
