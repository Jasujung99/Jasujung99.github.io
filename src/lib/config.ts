// Runtime config for external services
// Prefer Vite env, fallback to global window var injected by hosting (e.g., <script>window.__ANSWER_API__ = '...'</script>)
export const ANSWER_API_URL: string | null =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ANSWER_API_URL) ||
  (typeof window !== 'undefined' && (window as any).__ANSWER_API__) ||
  null;

// Optional Lead API endpoint for 상담/문의 제출(Cloudflare Worker /api/lead 등)
// Vite 환경변수 우선, 없으면 window.__LEAD_API__ 런타임 스니펫 사용
export const LEAD_API_URL: string | null =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_LEAD_API_URL) ||
  (typeof window !== 'undefined' && (window as any).__LEAD_API__) ||
  null;

// Optional Subscribe API endpoint for 이메일 소식 구독
export const SUBSCRIBE_API_URL: string | null =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUBSCRIBE_API_URL) ||
  (typeof window !== 'undefined' && (window as any).__SUBSCRIBE_API__) ||
  "https://sweet-bird-16a2.jasujung404.workers.dev/api/subscribe";
