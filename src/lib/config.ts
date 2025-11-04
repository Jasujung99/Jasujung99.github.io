// Runtime config for external services
// Prefer Vite env, fallback to global window var injected by hosting (e.g., <script>window.__ANSWER_API__ = '...'</script>)
export const ANSWER_API_URL: string | null =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ANSWER_API_URL) ||
  (typeof window !== 'undefined' && (window as any).__ANSWER_API__) ||
  null;
