# Jasujung99.github.io

React + Vite 기반 개인 사이트입니다. Tailwind CSS로 스타일링하고 GitHub Pages로 배포합니다.

## 개발 방법
- `npm install`
- `npm run dev`
- 브라우저에서 `http://localhost:5173` 확인

## 빌드
- `npm run build`
- 결과물은 `dist/` 디렉터리에 생성됩니다. GitHub Pages 배포 시 이 디렉터리를 사용합니다.

## 참고
- `public/CNAME` 파일은 도메인 설정에 필요합니다. 배포 시 누락하지 마세요.

---

## 구독(소식 받기) — Notion + 서버리스 백엔드
메일침프 없이, 간단한 이메일 입력 → 서버리스(Cloudflare Workers) → Notion DB 업서트 흐름으로 구성했습니다. 프런트는 한 줄 입력/안내만 노출됩니다.

### 동작 구조
- 프런트: `src/pages/HaeumHomePage.tsx` — 펼침식 이메일 입력 + `fetch(POST)`로 백엔드 호출
- 백엔드: Cloudflare Worker (예: `https://sweet-bird-16a2.jasujung404.workers.dev/api/subscribe`)
- 저장소: Notion Database (필드: `Email` Email, `Source` Select, `LastSeen` Date, `Name` Text)

### Worker 배포(예시)
레포의 예시 코드를 참고해 Workers에 배포하세요.
- 예시 코드: `samples/worker/worker.js`
- 예시 설정: `samples/worker/wrangler.toml.example`
- 환경변수(Workers → Settings → Variables)
  - `NOTION_TOKEN` (필수)
  - `NOTION_DATABASE_ID` (필수)
  - `ALLOWED_ORIGIN` = `https://haeumkorean.me` (프로덕션 도메인)

### 프런트 변경 요약
- 메일침프 폼/리다이렉트 제거
- ‘소식 받기’ 버튼 클릭 시 안내 + 이메일 입력 노출
- 성공/중복/오류 메시지 인라인 표시(새 탭 이동 없음)

---

## Notion Integration 토큰 발급 방법
1. Notion → Settings & members → Integrations → New integration
2. 권한: Database read/write 허용
3. 생성된 `Internal Integration Token`을 Worker의 `NOTION_TOKEN`으로 설정
4. 대상 데이터베이스 우측 상단 Share → Integration 초대(권한 부여)
5. 데이터베이스 ID는 URL의 32자 해시(예: `https://www.notion.so/workspace/<DB_ID>?v=...`)

## Notion DB 권장 속성
- `Email` (Email)
- `Source` (Select) — 예: `haeum-homepage`, `ads`, `referral`
- `LastSeen` (Date)
- `Name` (Text)

---

## GitHub Actions
- 현재 레포에는 Mailchimp 관련 워크플로가 포함되어 있지 않습니다. 구독 기능은 Cloudflare Worker(서버리스)로 처리합니다.


---

## DocBot + Cloudflare Workers AI (자연어 답변)
현재 사이트의 DocBot은 기본적으로 KB(문서) 검색/발췌로 동작합니다. 더 자연스럽고 친절한 문장형 답변을 위해 Cloudflare Workers AI와 연동할 수 있습니다.

### 1) 워커 배포
- 샘플 코드: `samples/worker/answer-worker.ts`
- 설정 예시: `samples/worker/wrangler.toml.example`
- 절차(요약)
  1. Cloudflare 대시보드 → Workers AI 활성화
  2. 새 Worker 생성 후 위 소스 업로드(or wrangler 사용)
  3. wrangler.toml에 [ai] 바인딩 추가, `vars.ALLOWED_ORIGIN`을 배포 도메인으로 설정
  4. 배포 완료 후 발급된 URL(예: `https://<subdomain>.<name>.workers.dev`)

### 2) 프런트엔드 연결
- 빌드 시 환경변수로 API URL을 주입합니다.
  - Vite 환경변수: `VITE_ANSWER_API_URL=https://<...>.workers.dev`
- 런타임 구성은 `src/lib/config.ts`를 통해 불러옵니다.
  - 우선순위: `import.meta.env.VITE_ANSWER_API_URL` → `window.__ANSWER_API__` → null
- 설정이 없을 경우 DocBot은 기존 “발췌형”으로 자동 폴백합니다.

### 3) 보안/CORS
- 워커 `ALLOWED_ORIGIN`에 사이트 기원을 설정하세요(예: `https://haeumkorean.me`).
- 로컬 테스트는 `*` 허용 또는 `http://localhost:5173`로 설정하세요.

### 4) 사용 방법
- 개발: `npm run dev` → 우하단 DocBot 열기 → 질문 입력
- 프로덕션: Worker 배포 후 `VITE_ANSWER_API_URL` 설정하여 빌드/배포

### 5) 고도화(선택)
- 스트리밍 응답, Vectorize(임베딩 RAG), 캐시/레이트리밋 강화 가능

## KB(문서) 구조 안내
- 런타임 로드: `/public/kb/manifest.json`에 등록된 Markdown/TXT만 로드합니다.
- 기본 단일 문서: `public/kb/about.md` (소개 + FAQ 통합)
- 정리: `public/kb/assets.md`, `public/kb/faq.md`는 제거되어 더 이상 사용하지 않습니다.
