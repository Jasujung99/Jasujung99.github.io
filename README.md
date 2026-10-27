# Jasujung99.github.io

해움한국어 소개 사이트. 대표 주소는 https://haeum.haeonkorean.com/.

React와 Vite로 만들었고 GitHub Actions에서 Node.js 20으로 `npm ci → npm run build → dist`를 GitHub Pages에 배포한다. main에 변경이 들어가면 배포된다.

두 CNAME 파일은 대표 주소를 기록한다. Actions 배포에서 이 파일만 바꿔서는 실제 Custom domain이 변경되지 않으며, 저장소 Pages 설정과 DNS는 별도로 적용해야 한다. 하위 도메인이므로 Vite의 기본 base `/`를 유지한다.

전환 순서, 운영 Worker CORS 설정, 검증 및 되돌리기: [도메인 변경 안내](docs/domain-migration.md).

환경·빌드·CORS·로컬 화면 점검 결과: [검증 기록](docs/domain-migration-validation.md).

React 라우트·섹션 anchor·전체 public 파일의 이전 대응표: [URL inventory](docs/url-migration-inventory.md). 온라인 학습은 2026-10-27 사용자 결정에 따라 **개발 중**으로 유지하며 어휘 시작 버튼을 노출하지 않는다. 별도 어휘 서비스 주소는 `https://words.haeonkorean.com`이고 호스팅은 기존 `boa-newwords.pages.dev`를 유지한다. 도메인·DNS·HTTPS와 운영 Worker 두 Origin 허용은 적용·검증했으며, PR #4의 최종 병합·배포 결과는 해당 PR과 Actions 기록에서 확인한다.

실행

Node.js 20에서 다음 명령을 실행한다.

```sh
npm ci
npm run dev
```

빌드는 `npm run build`, Worker CORS 회귀 검증은 `node --test samples/worker/cors.test.mjs`로 실행한다. CORS 테스트는 로컬 handler만 사용하며 운영 API에 데이터를 쓰지 않는다.

구성: 해움 홈, 교육상담, 소식 구독, 지식 글
