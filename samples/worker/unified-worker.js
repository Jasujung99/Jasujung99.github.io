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
      return new Response(JSON.stringify({ error: 'server_error', message: err.message || String(err) }), { 
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

  // 1. Resolve Data Source ID (Handle Notion 2025-09-03 Multi-source DB)
  let dsId = dbId;
  const dbReq = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
    method: 'GET',
    headers: notionHeaders(token)
  });

  if (dbReq.ok) {
    const dbData = await dbReq.json();
    if (dbData.data_sources && dbData.data_sources.length > 0) {
      // Pick the first data source as the target
      dsId = dbData.data_sources[0].id;
    }
  } else if (dbReq.status === 404) {
    // If it's 404, the provided ID might already be a data_source_id
    dsId = dbId;
  } else {
    const detail = await dbReq.text();
    return new Response(JSON.stringify({ error: 'notion_db_retrieval_failed', detail }), { status: 502, headers: corsHeaders(origin, env) });
  }

  // 2. Query Data Source
  const q = await fetch(`https://api.notion.com/v1/data_sources/${dsId}/query`, {
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
    // 3. Create New Page in Data Source
    const props = {
      Email: { email },
      Source: { select: { name: source } },
      LastSeen: { date: { start: nowIso } },
    };
    if (name) props['Name'] = { title: [{ type: 'text', text: { content: name } }] };

    const c = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders(token),
      body: JSON.stringify({ 
        parent: { type: 'data_source_id', data_source_id: dsId }, 
        properties: props 
      })
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
 * Handle AI Answer (Hybrid: Upstage Solar or Workers AI)
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

  if (!question) {
    return new Response(JSON.stringify({ error: 'missing_params', detail: 'Question is required' }), { status: 400, headers: corsHeaders(origin, env) });
  }

  const sys = [
    "너는 해움한국어 안내 도우미야.",
    "제공된 발췌(context)가 있다면 이를 우선적으로 참고해 답변해.",
    "발췌 정보가 없거나 부족하더라도 아는 범위 내에서 친절하게 답하되, 확실하지 않은 내용은 '확인이 필요하다'고 안내해.",
    "톤은 따뜻하고 간결하게. 불필요한 장황함은 피하고 목록은 2~4개까지만.",
    "사용자 언어를 감지해 동일한 언어로 답하되 기본은 한국어.",
  ].join("\n");

  const joinedContext = context.length > 0 
    ? context.map((c, i) => `[#${i + 1}] ${c}`).join("\n")
    : "발췌 정보 없음";

  const prompt = `질문: ${question}\n\n참고 발췌:\n${joinedContext}\n\n규칙:\n- 응답 길이: 3~6문장\n- 필요하면 불릿 2~4개로 정리`;

  let lastError = null;
  let servicesChecked = [];

  // 1. Try Upstage (Solar) if API Key exists
  if (env.UPSTAGE_API_KEY) {
    servicesChecked.push('Upstage');
    try {
      const upstageResp = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.UPSTAGE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'solar-1-mini-chat',
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        })
      });

      if (upstageResp.ok) {
        const data = await upstageResp.json();
        const text = data.choices?.[0]?.message?.content || "";
        if (text) return new Response(JSON.stringify({ ok: true, text }), { headers: corsHeaders(origin, env) });
      } else {
        const errText = await upstageResp.text();
        lastError = `Upstage error (${upstageResp.status}): ${errText}`;
      }
    } catch (e) {
      lastError = `Upstage fetch error: ${e.message}`;
    }
  }

  // 2. Fallback to Cloudflare Workers AI
  if (env.AI) {
    servicesChecked.push('Workers AI');
    const messages = [
      { role: "system", content: sys },
      { role: "user", content: prompt },
    ];

    try {
      const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages,
        temperature: 0.2,
        max_output_tokens: 600,
      });

      const text = result?.response || result?.output_text || "";
      if (text) return new Response(JSON.stringify({ ok: true, text }), { headers: corsHeaders(origin, env) });
      
      lastError = `Workers AI empty response. ${lastError || ''}`;
    } catch (e) {
      lastError = `Workers AI error: ${e.message}. ${lastError || ''}`;
    }
  }

  // 3. No AI service available or all failed
  if (servicesChecked.length === 0) {
    const availableKeys = Object.keys(env).filter(k => !k.includes('TOKEN') && !k.includes('KEY')); // 보안을 위해 토큰/키 이름은 제외하고 출력
    // 대신 특정 키가 있는지 여부만 확인
    const hasUpstage = !!env.UPSTAGE_API_KEY;
    const hasAI = !!env.AI;
    
    return new Response(JSON.stringify({ 
      error: 'no_ai_service', 
      detail: `Neither UPSTAGE_API_KEY nor Workers AI Binding ("AI") is detected by the code. (HasUpstage: ${hasUpstage}, HasAI: ${hasAI})` 
    }), { status: 500, headers: corsHeaders(origin, env) });
  }

  return new Response(JSON.stringify({ 
    error: 'ai_failed', 
    detail: lastError,
    tried: servicesChecked.join(', ')
  }), { status: 500, headers: corsHeaders(origin, env) });
}

/**
 * Helpers
 */
function notionHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2025-09-03',
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
