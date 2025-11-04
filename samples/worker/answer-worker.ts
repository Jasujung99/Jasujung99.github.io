// Cloudflare Workers AI integration for Haeum DocBot
// - Endpoint: POST /api/answer
// - Input: { question: string, context: string[] }
// - Output: { ok: boolean, text?: string, error?: string }
//
// Deployment steps:
// 1) Enable Workers AI in your Cloudflare account
// 2) Create a Worker with this source, bind AI in wrangler.toml ([ai] binding = "AI")
// 3) Set ALLOWED_ORIGIN to your site origin (e.g., https://haeumkorean.me)
// 4) Deploy via: wrangler deploy
//
export interface Env {
  AI: Ai; // Workers AI binding (see wrangler.toml [ai])
  ALLOWED_ORIGIN?: string;
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  } as Record<string, string>;
}

function detectOrigin(req: Request, env: Env): string {
  const o = req.headers.get("Origin") || "";
  const allow = env.ALLOWED_ORIGIN || "*";
  if (allow === "*") return "*";
  return o && o === allow ? o : allow;
}

function isPreflight(req: Request) {
  return req.method === "OPTIONS" && req.headers.get("Origin") && req.headers.get("Access-Control-Request-Method");
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = detectOrigin(req, env);

    if (isPreflight(req)) {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "bad_json" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const question: string | undefined = body?.question;
    const context: string[] = Array.isArray(body?.context) ? body.context : [];

    if (!question || context.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "missing_params" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Compose prompt
    const sys = [
      "너는 해움한국어 안내 도우미야.",
      "다음에 제공되는 발췌(context)만 사실 근거로 사용해.",
      "모르면 모른다고 답하고 외부 추측은 하지 마.",
      "톤은 따뜻하고 간결하게. 불필요한 장황함은 피하고 목록은 2~4개까지만.",
      "사용자 언어를 감지해 동일한 언어로 답하되 기본은 한국어.",
    ].join("\n");

    const joined = context.map((c, i) => `[#${i + 1}] ${c}`).join("\n");

    const messages = [
      { role: "system", content: sys },
      {
        role: "user",
        content: `질문: ${question}\n\n참고 발췌:\n${joined}\n\n규칙:\n- 출처가 없으면 모른다고 답하기\n- 응답 길이: 3~6문장\n- 필요하면 불릿 2~4개로 정리`,
      },
    ];

    try {
      const result: any = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages,
        temperature: 0.2,
        max_output_tokens: 360,
      });
      const text: string = result?.response || result?.output_text || "";
      if (!text) throw new Error("empty_output");
      return new Response(JSON.stringify({ ok: true, text }), {
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ ok: false, error: "ai_error", detail: String(e?.message || e) }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }
  },
};
