// Unified Cloudflare Worker for Haeum Korean
// Handles both:
// 1) POST /api/subscribe -> Notion Email Subscription
// 2) POST /api/answer -> Workers AI Chatbot
//
// Env vars required:
// - NOTION_TOKEN
// - NOTION_DATABASE_ID
// - ALLOWED_ORIGIN (e.g. "https://haeumkorean.me, https://heaumkorean.me")
// - AI (Binding for Workers AI)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }

    // 2. Routing
    try {
      if (url.pathname === '/api/subscribe') {
        return await handleSubscribe(request, env, origin);
      } else if (url.pathname === '/api/answer') {
        return await handleAnswer(request, env, origin);
      } else {
        return new Response(JSON.stringify({ error: 'not_found', path: url.pathname }), { 
          status: 404, 
          headers: corsHeaders(origin, env) 
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: 'server_error', message: err.message }), { 
        status: 500, 
        headers: corsHeaders(origin, env) 
      });
    }
  }
};

/**
 * Handle Email Subscription (Notion)
 */
async function handleSubscribe(request, env, origin) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: corsHeaders(origin, env) });
  }

  if (!isAllowedOrigin(origin, env)) {
    return new Response(JSON.stringify({ error: 'cors_blocked', origin }), { status: 403, headers: corsHeaders(origin, env) });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const source = String(body.source || 'haeum-homepage');
  const name = (body.name ? String(body.name) : '').trim();

  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'invalid_email', received: email }), { status: 400, headers: corsHeaders(origin, env) });
  }

  const token = env.NOTION_TOKEN;
  const dbId = env.NOTION_DATABASE_ID;
  if (!token || !dbId) {
    return new Response(JSON.stringify({ error: 'server_misconfigured', detail: 'Missing Notion env vars' }), { status: 500, headers: corsHeaders(origin, env) });
  }

  // Notion Query
  const q = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: notionHeaders(token),
    body: JSON.stringify({ filter: { property: 'Email', email: { equals: email } }, page_size: 1 })
  });
  
  if (!q.ok) {
    const detail = await q.text();
    return new Response(JSON.stringify({ error: 'notion_query_failed', detail }), { status: 502, headers: corsHeaders(origin, env) });
  }
  
  const qData = await q.json();
  const nowIso = new Date().toISOString();

  if ((qData.results || []).length === 0) {
    // Create New
    const props = {
      Email: { email },
      Source: { select: { name: source } },
      LastSeen: { date: { start: nowIso } },
    };
    if (name) props['Name'] = { title: [{ type: 'text', text: { content: name } }] };

    const c = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders(token),
      body: JSON.stringify({ parent: { database_id: dbId }, properties: props })
    });
    if (!c.ok) {
      const detail = await c.text();
      return new Response(JSON.stringify({ error: 'notion_create_failed', detail }), { status: 502, headers: corsHeaders(origin, env) });
    }
    return new Response(JSON.stringify({ ok: true, created: true }), { status: 200, headers: corsHeaders(origin, env) });
  } else {
    // Update Existing
    const pageId = qData.results[0].id;
    const props = { LastSeen: { date: { start: nowIso } } };
    if (name) props['Name'] = { title: [{ type: 'text', text: { content: name } }] };
    
    const u = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: notionHeaders(token),
      body: JSON.stringify({ properties: props })
    });
    if (!u.ok) {
      const detail = await u.text();
      return new Response(JSON.stringify({ error: 'notion_update_failed', detail }), { status: 502, headers: corsHeaders(origin, env) });
    }
    return new Response(JSON.stringify({ ok: true, created: false }), { status: 200, headers: corsHeaders(origin, env) });
  }
}

/**
 * Handle AI Answer (Workers AI)
 */
async function handleAnswer(request, env, origin) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: corsHeaders(origin, env) });
  }

  if (!isAllowedOrigin(origin, env)) {
    return new Response(JSON.stringify({ error: 'cors_blocked', origin }), { status: 403, headers: corsHeaders(origin, env) });
  }

  const body = await request.json().catch(() => ({}));
  const question = body.question;
  const context = Array.isArray(body.context) ? body.context : [];

  if (!question || context.length === 0) {
    return new Response(JSON.stringify({ error: 'missing_params' }), { status: 400, headers: corsHeaders(origin, env) });
  }

  if (!env.AI) {
    return new Response(JSON.stringify({ error: 'ai_not_bound' }), { status: 500, headers: corsHeaders(origin, env) });
  }

  const sys = [
    "너는 해움한국어 안내 도우미야.",
    "다음에 제공되는 발췌(context)만 사실 근거로 사용해.",
    "모르면 모른다고 답하고 외부 추측은 하지 마.",
    "톤은 따뜻하고 간결하게. 불필요한 장황함은 피하고 목록은 2~4개까지만.",
    "사용자 언어를 감지해 동일한 언어로 답하되 기본은 한국어.",
  ].join("\n");

  const joinedContext = context.map((c, i) => `[#${i + 1}] ${c}`).join("\n");

  const messages = [
    { role: "system", content: sys },
    {
      role: "user",
      content: `질문: ${question}\n\n참고 발췌:\n${joinedContext}\n\n규칙:\n- 출처가 없으면 모른다고 답하기\n- 응답 길이: 3~6문장\n- 필요하면 불릿 2~4개로 정리`,
    },
  ];

  const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    messages,
    temperature: 0.2,
    max_output_tokens: 400,
  });

  const text = result?.response || result?.output_text || "";
  return new Response(JSON.stringify({ ok: true, text }), { 
    headers: corsHeaders(origin, env) 
  });
}

/**
 * Helpers
 */
function notionHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };
}

function corsHeaders(origin, env) {
  const allow = env.ALLOWED_ORIGIN || '*';
  let headerValue = allow;
  
  if (allow !== '*' && origin) {
    const allowedOrigins = allow.split(',').map(o => o.trim());
    try {
      const originUrl = new URL(origin).origin;
      if (allowedOrigins.some(ao => {
        try { return new URL(ao).origin === originUrl; } catch { return false; }
      })) {
        headerValue = origin;
      }
    } catch (e) {}
  }

  return {
    'Access-Control-Allow-Origin': headerValue,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

function isAllowedOrigin(origin, env) {
  const allow = env.ALLOWED_ORIGIN;
  if (!allow || allow === '*') return true;
  
  const allowedOrigins = allow.split(',').map(o => o.trim());
  try {
    const originUrl = new URL(origin).origin;
    return allowedOrigins.some(ao => {
      try { return new URL(ao).origin === originUrl; } catch { return false; }
    });
  } catch {
    return false;
  }
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v));
}
