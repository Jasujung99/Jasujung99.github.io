import React from "react";
import { buildIndex, search, type KBIndex } from "@/lib/docsearch";
import { ANSWER_API_URL } from "@/lib/config";

export type DocBotProps = {
  className?: string;
};

export default function DocBot({ className = "" }: DocBotProps): JSX.Element {
  // AI 전용 표시 모드: 화면에는 AI 답변만 보여주고, 문서 하이라이트(출처) UI는 숨깁니다.
  // 내부적으로는 여전히 로컬 KB를 검색해 컨텍스트를 구성해 비용 대비 품질을 유지합니다.
  const AI_ONLY = true;
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [index, setIndex] = React.useState<KBIndex | null>(null);
  const [q, setQ] = React.useState("");
  const [hits, setHits] = React.useState<ReturnType<typeof search>>([]);
  const [generating, setGenerating] = React.useState(false);
  const [answer, setAnswer] = React.useState<string | null>(null);
  const aiAvailable = Boolean(ANSWER_API_URL);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // 빠른 질문(퀵 리플라이)
  const quickQuestions = React.useMemo(
    () => [
      "운영 시간은 어떻게 되나요?",
      "오시는 길/위치는 어디인가요?",
      "어떤 프로그램이 있나요?",
      "문의는 어디로 하면 되나요?",
      "진행은 어떻게 하나요?",
    ],
    []
  );

  // Lazy build index on first open
  React.useEffect(() => {
    if (!open || index) return;
    let cancelled = false;
    setLoading(true);
    buildIndex().then((idx) => {
      if (!cancelled) setIndex(idx);
    }).catch(() => {
      if (!cancelled) setIndex({ sections: [], idf: new Map() });
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, index]);

  // Autofocus input on open
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on outside click
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // ESC to close
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function generateAnswer(question: string, ctx: string[]): Promise<string | null> {
    if (!ANSWER_API_URL) return null;
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(ANSWER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: ctx }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!resp.ok) return null;
      const data = await resp.json().catch(() => null);
      if (data && data.ok && typeof data.text === "string") return data.text;
      return null;
    } catch {
      return null;
    }
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const query = q.trim();
    if (!query) return;
    setAnswer(null);
    let res: ReturnType<typeof search> = [];
    if (index) {
      res = search(query, index, 5);
      setHits(res);
    } else {
      setHits([]);
    }

    if (aiAvailable) {
      setGenerating(true);
      // Build compact context from highlights (or fallback to section text)
      const ctx: string[] = [];
      if (res && res.length > 0) {
        for (const h of res) {
          if (h.highlights.length > 0) {
            ctx.push(h.highlights.join("\n"));
          } else {
            ctx.push(h.section.text.slice(0, 500));
          }
          if (ctx.join("\n").length > 1400) break; // cap ~1.4k chars to save tokens
        }
      }
      const text = await generateAnswer(query, ctx.slice(0, 3));
      if (text) setAnswer(text);
      setGenerating(false);
    }
  }

  // 단순 링크 변환 렌더러: http/https URL을 클릭 링크로, 줄바꿈 유지
  function renderAnswer(text: string) {
    const urlRe = /(https?:\/\/[^\s)]+)(?=\s|\)|$)/g;
    const lines = text.split(/\n/);
    return (
      <div className="text-[13px] leading-relaxed text-[#2d4b45]">
        {lines.map((line, i) => {
          const parts: (string | { url: string })[] = [];
          let lastIndex = 0;
          line.replace(urlRe, (m, url: string, offset: number) => {
            if (offset > lastIndex) parts.push(line.slice(lastIndex, offset));
            parts.push({ url });
            lastIndex = offset + m.length;
            return m;
          });
          if (lastIndex < line.length) parts.push(line.slice(lastIndex));
          return (
            <div key={i}>
              {parts.map((p, j) =>
                typeof p === 'string' ? (
                  <React.Fragment key={j}>{p}</React.Fragment>
                ) : (
                  <a key={j} href={p.url} target="_blank" rel="noopener noreferrer" className="text-[#2a6a66] underline break-all">
                    {p.url}
                  </a>
                )
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function quickAsk(question: string) {
    setQ(question);
    // 입력값 반영 후 제출
    setTimeout(() => onSubmit(), 0);
  }

  const emptyKB = index && index.sections.length === 0;

  return (
    <>
      <button
        type="button"
        aria-label="문서 도움봇 열기"
        title="문서 도움봇"
        onClick={() => setOpen((v) => !v)}
        className={[
          "pointer-events-auto fixed right-4 bottom-4 z-50 h-11 w-11 rounded-full",
          "bg-[#317873] text-white shadow-lg outline-none ring-0",
          "hover:bg-[#2a6a66] focus:ring-2 focus:ring-offset-2 focus:ring-[#a1d4ca]",
          className,
        ].join(" ")}
      >
        <span className="sr-only">문서 도움봇</span>
        {/* 말풍선 채팅 아이콘 */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mx-auto h-5 w-5">
          <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM8 9a1 1 0 100 2h8a1 1 0 100-2H8z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="문서 도움봇 패널"
          className="pointer-events-auto fixed right-4 bottom-20 z-50 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b bg-white/80 px-3 py-2 text-sm">
            <div className="font-medium text-[#317873]">AI 도움봇</div>
            <button className="rounded p-1 text-gray-500 hover:bg-gray-50" onClick={() => setOpen(false)} aria-label="닫기">✕</button>
          </div>

          <div className="max-h-80 overflow-auto p-3 text-sm">
            {loading && !AI_ONLY && <div className="text-gray-500">문서를 준비하는 중…</div>}
            {!loading && emptyKB && !AI_ONLY && (
              <div className="space-y-2 text-gray-600">
                <p>아직 연결된 문서가 없습니다.</p>
                <p className="text-xs">관리자: <code>/public/kb/manifest.json</code>에 문서를 등록해 주세요.</p>
              </div>
            )}

            {/* AI composed answer (beta) */}
            {!loading && (generating || answer) && (
              <div className="mb-3 rounded-md border border-[#317873]/20 bg-[#f3fbf9] p-3 text-[#285f5b]">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#317873]">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#317873]"></span>
                    AI 답변
                  </span>
                  {generating && <span className="ml-auto inline-flex items-center gap-2 text-[11px] text-[#317873]">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#317873]/30 border-t-[#317873]" />
                    답변 작성 중…
                  </span>}
                </div>
                {answer && renderAnswer(answer)}
                {!answer && generating && <div className="text-[13px] text-[#2d4b45]">답변을 준비하고 있어요…</div>}
              </div>
            )}

            {/* Empty hint */}
            {!loading && hits.length === 0 && !generating && !answer && (
              <div className="text-gray-600">
                <div className="mb-2">무엇이 궁금하신가요? 편하게 질문해 주세요.</div>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((qq) => (
                    <button
                      key={qq}
                      type="button"
                      onClick={() => quickAsk(qq)}
                      className="rounded-full border border-[#317873]/30 bg-white px-3 py-1 text-[12px] text-[#2a6a66] hover:bg-[#f0faf7]"
                    >
                      {qq}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sources (highlights) */}
            {!loading && hits.length > 0 && !AI_ONLY && (
              <div className="space-y-3">
                {hits.map((h, i) => (
                  <div key={i} className="rounded-md bg-gray-50/70 p-2">
                    <div className="mb-1 font-semibold text-[#3e5b52]">{h.section.title}</div>
                    {h.highlights.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {h.highlights.map((s: string, j: number) => (
                          <li key={j} className="text-gray-800">{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700">{h.section.text.slice(0, 160)}{h.section.text.length > 160 ? '…' : ''}</p>
                    )}
                    <div className="mt-1 text-[11px] text-gray-500">출처: {h.section.file}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={(e) => onSubmit(e)} className="flex gap-2 border-t bg-white/80 p-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="질문을 입력하세요"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey) return; // allow newline in textarea variant
              }}
              className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#317873] focus:outline-none focus:ring-1 focus:ring-[#a1d4ca]"
              aria-label="질문 입력"
            />
            <button type="submit" className="rounded-md bg-[#317873] px-3 py-1 text-sm text-white hover:bg-[#2a6a66]">전송</button>
          </form>
        </div>
      )}
    </>
  );
}
