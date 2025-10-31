# Jasujung99.github.io

React + Vite 기반으로 구성된 개인 사이트입니다. Tailwind CSS로 스타일링하고 GitHub Pages를 통해 배포할 수 있도록 준비되어 있습니다.

## 개발 방법

- `npm install`
- `npm run dev`
- 브라우저에서 `http://localhost:5173` 확인

## 빌드

- `npm run build`
- 결과물은 `dist/` 디렉터리에 생성됩니다. GitHub Pages로 배포할 때는 이 디렉터리를 사용하세요.

## 참고

- `public/CNAME` 파일은 Namecheap에서 연결한 도메인 정보를 포함합니다. 배포 시 누락되지 않도록 유지하세요.
- 메일 구독 기능을 사용하려면 `.env` 파일에 `VITE_SUBSCRIPTION_ENDPOINT` 값을 설정하세요. Mailchimp 임베드 폼의 `action` URL을 그대로 넣으면 됩니다. 예:
  - `VITE_SUBSCRIPTION_ENDPOINT="https://us16.list-manage.com/subscribe/post?u=<UID>&id=<LIST_ID>"`

---

## Mailchimp-first(정적 배포 유지) 구성 가이드

GitHub Pages(정적 배포)를 유지하면서 구독 즉시 웰컴 메일을 보내고, Notion DB로 동기화합니다. Zapier/Make 없이 동작합니다.

### A) 폼을 Mailchimp로 전환(즉시 웰컴 메일)
1. Mailchimp → Audience → Signup forms → Embedded forms에서 코드 복사
2. `action` URL 형태: `https://<DC>.list-manage.com/subscribe/post?u=<UID>&id=<LIST_ID>`
   - 예시: `https://us16.list-manage.com/subscribe/post?u=YOUR_UID&id=7470798e2b`
   - 여기서 `<DC>`는 데이터센터 코드(예: `us16`), `<UID>`는 Mailchimp가 부여한 고유 값, `<LIST_ID>`는 Audience ID입니다.
3. 프로젝트의 구독 폼(action)을 위 URL로 교체하고, 필드명을 Mailchimp 규격에 맞춥니다.
   - 이메일 필드 이름은 반드시 `EMAIL`
   - (선택) 소스 전달: Mailchimp에서 커스텀 merge field를 만든 후, 같은 이름의 hidden input 추가

참고: Mailchimp 임베드 코드에는 봇 방지용 hidden 필드가 포함됩니다. 제공된 코드를 가능한 그대로 사용하고, Tailwind로 감싸 스타일만 맞추는 방식을 권장합니다.

### B) 웰컴 메일 자동화 ON
- Mailchimp → Automations(또는 Customer Journeys)
- 트리거: "When someone subscribes to audience" 또는 특정 태그 추가 시
- 더블 옵트인 사용 시: Audience 설정에서 Enable double opt-in

### C) GitHub Actions(스케줄)로 Mailchimp → Notion 동기화
정적 사이트는 그대로 두고, 주기적으로 Mailchimp Audience를 읽어 Notion DB에 업서트합니다.

- 워크플로: `.github/workflows/mailchimp-notion-sync.yml`
- 스크립트: `.github/scripts/sync-mailchimp-to-notion.js`
- 실행 트리거: 매 시 17분(UTC), 또는 수동 실행(workflow_dispatch)

필요 Secrets(Repository → Settings → Secrets and variables → Actions → New repository secret):
- `MAILCHIMP_API_KEY`: Mailchimp API Key
- `MAILCHIMP_DC`: 데이터센터 코드 (예: `usXX` 형식)
- `MAILCHIMP_LIST_ID`: Audience ID
- `NOTION_TOKEN`: Notion Integration 토큰
- `NOTION_DATABASE_ID`: Notion DB ID

참고: 실제 값은 커밋하지 마세요. 로컬 개발은 `.env` 파일(예: `.env.local`)에, CI는 GitHub Secrets에 설정합니다. 예시는 루트의 `.env.example`를 참고하세요.

수동 실행 방법:
- GitHub → Actions → "Mailchimp → Notion Sync" → Run workflow

### D) Notion Integration 토큰 발급 방법
1. Notion → Settings & members → Integrations → New integration
2. 이름/아이콘 지정, 권한은 Database read/write 허용
3. 생성 후 `Internal Integration Token` 복사 → `NOTION_TOKEN`으로 GitHub Secrets에 저장
4. 동기화 대상 데이터베이스를 열고, 우측 상단 Share → 해당 Integration을 초대(권한 부여)
5. 데이터베이스 ID는 URL의 32자 해시(예: `https://www.notion.so/workspace/<DB_ID>?v=...`)

### E) Notion DB 권장 속성
- `Email` (Email)
- `Source` (Select) — 예: `haeum-homepage`, `mailchimp`, `ads`
- `LastSeen` (Date)
- (선택) `Status` (Select: 구독중/탈퇴), `Name` (Text)

### F) 주의/팁
- Mailchimp는 동일 이메일 중복을 자동으로 방지합니다. Actions 스크립트는 Notion에서 `Email equals`로 업서트 처리합니다.
- 웰컴 메일은 Mailchimp 자동화에서 즉시 발송되므로 프런트엔드/Actions에서 별도 메일 발송이 필요 없습니다.
- 더블 옵트인 사용 시, 최종 웰컴 메일은 확인 후에 발송됩니다.
- 로그에 이메일 등 PII를 과도하게 남기지 않도록 주의하세요.
