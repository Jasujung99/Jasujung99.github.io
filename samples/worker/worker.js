// Cloudflare Worker — Notion subscribe endpoint
// Route: POST /api/subscribe
// Env vars: NOTION_TOKEN, NOTION_DATABASE_ID, ALLOWED_ORIGIN (optional)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (url.pathname !== '/api/subscribe') {
      return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: corsHeaders(env) });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: corsHeaders(env) });
    }

    // Optional origin check
    const origin = request.headers.get('Origin') || '';
    if (!isAllowedOrigin(origin, env)) {
      return new Response(JSON.stringify({ error: 'cors_blocked' }), { status: 403, headers: corsHeaders(env) });
    }

    try {
      const body = await request.json().catch(() => ({}));
      const email = String(body.email || '').trim().toLowerCase();
      const source = String(body.source || 'haeum-homepage');
      const name = (body.name ? String(body.name) : '').trim();

      if (!isValidEmail(email)) {
        return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400, headers: corsHeaders(env) });
      }

      const NOTION_TOKEN = env.NOTION_TOKEN;
      const NOTION_DB = env.NOTION_DATABASE_ID;
      if (!NOTION_TOKEN || !NOTION_DB) {
        return new Response(JSON.stringify({ error: 'server_misconfigured' }), { status: 500, headers: corsHeaders(env) });
      }

      // 1) Query existing by Email
      const q = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB}/query`, {
        method: 'POST',
        headers: notionHeaders(NOTION_TOKEN),
        body: JSON.stringify({ filter: { property: 'Email', email: { equals: email } }, page_size: 1 })
      });
      if (!q.ok) {
        const t = await q.text();
        return new Response(JSON.stringify({ error: 'notion_query_failed', detail: t }), { status: 502, headers: corsHeaders(env) });
      }
      const qData = await q.json();
      const nowIso = new Date().toISOString();

      if ((qData.results || []).length === 0) {
        // 2) Create new
        const props = {
          Email: { email },
          Source: { select: { name: source } },
          LastSeen: { date: { start: nowIso } },
        };
        if (name) props['Name'] = { title: [{ type: 'text', text: { content: name } }] };

        const c = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: notionHeaders(NOTION_TOKEN),
          body: JSON.stringify({ parent: { database_id: NOTION_DB }, properties: props })
        });
        if (!c.ok) {
          const t = await c.text();
          return new Response(JSON.stringify({ error: 'notion_create_failed', detail: t }), { status: 502, headers: corsHeaders(env) });
        }
        return new Response(JSON.stringify({ ok: true, created: true }), { status: 200, headers: corsHeaders(env) });
      } else {
        // 3) Update LastSeen (and optionally Name if provided)
        const pageId = qData.results[0].id;
        const props = { LastSeen: { date: { start: nowIso } } };
        if (name) props['Name'] = { title: [{ type: 'text', text: { content: name } }] };
        const u = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
          method: 'PATCH',
          headers: notionHeaders(NOTION_TOKEN),
          body: JSON.stringify({ properties: props })
        });
        if (!u.ok) {
          const t = await u.text();
          return new Response(JSON.stringify({ error: 'notion_update_failed', detail: t }), { status: 502, headers: corsHeaders(env) });
        }
        return new Response(JSON.stringify({ ok: true, created: false }), { status: 200, headers: corsHeaders(env) });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: 'server_error' }), { status: 500, headers: corsHeaders(env) });
    }
  }
};

function notionHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };
}

function corsHeaders(env) {
  const allow = env.ALLOWED_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

function isAllowedOrigin(origin, env) {
  const allow = env.ALLOWED_ORIGIN;
  if (!allow) return true; // 개발 중엔 모든 오리진 허용
  try { return new URL(origin).origin === new URL(allow).origin; } catch { return false; }
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v));
}
