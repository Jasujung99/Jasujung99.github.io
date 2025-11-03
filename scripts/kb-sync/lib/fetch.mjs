const DEFAULT_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 600;

export async function fetchWithRetry(url, opts = {}, retries = DEFAULT_RETRIES, backoffMs = DEFAULT_BACKOFF_MS) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow', ...opts });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (i === retries) break;
      await new Promise(r => setTimeout(r, backoffMs * Math.pow(1.5, i)));
    }
  }
  throw lastErr;
}
