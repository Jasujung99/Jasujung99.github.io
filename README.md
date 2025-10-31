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
