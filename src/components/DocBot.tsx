import React from "react";
import { buildIndex, search, type KBIndex } from "@/lib/docsearch";
import { ANSWER_API_URL } from "@/lib/config";

export type DocBotProps = {
  className?: string;
};

export default function DocBot({ className = "" }: DocBotProps): JSX.Element {
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
    if (!index) return;
    const query = q.trim();
    if (!query) return;
    setAnswer(null);
    const res = search(query, index, 5);
    setHits(res);

    if (aiAvailable) {
      setGenerating(true);
      // Build compact context from highlights (or fallback to section text)
      const ctx: string[] = [];
      for (const h of res) {
        if (h.highlights.length > 0) {
          ctx.push(h.highlights.join("\n"));
        } else {
          ctx.push(h.section.text.slice(0, 500));
        }
        if (ctx.join("\n").length > 1400) break; // cap ~1.4k chars to save tokens
      }
      const text = await generateAnswer(query, ctx.slice(0, 3));
      if (text) setAnswer(text);
      setGenerating(false);
    }
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mx-auto h-5 w-5">
          <path d="M12 2a10 10 0 1 0 6.32 17.9l2.09.63a1 1 0 0 0 1.25-1.24l-.63-2.1A10 10 0 0 0 12 2zm0 4a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 12 6zm-2 5h2a1 1 0 0 1 1 1v5h-2v-4h-1v-2z" />
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
            <div className="font-medium text-[#317873]">문서 도움봇</div>
            <button className="rounded p-1 text-gray-500 hover:bg-gray-50" onClick={() => setOpen(false)} aria-label="닫기">✕</button>
          </div>

          <div className="max-h-80 overflow-auto p-3 text-sm">
            {loading && <div className="text-gray-500">문서를 준비하는 중…</div>}
            {!loading && emptyKB && (
              <div className="space-y-2 text-gray-600">
                <p>아직 연결된 문서가 없습니다.</p>
                <p className="text-xs">관리자: <code>/public/kb/manifest.json</code>에 문서를 등록해 주세요.</p>
              </div>
            )}

            {/* AI composed answer (beta) */}
            {!loading && !emptyKB && (generating || answer) && (
              <div className="mb-3 rounded-md border border-[#317873]/20 bg-[#f3fbf9] p-3 text-[#285f5b]">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#317873]">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#317873]"></span>
                    AI 답변
                  </span>
                  {generating && <span className="ml-auto inline-flex items-center gap-2 text-[11px] text-[#317873]">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#317873]/30 border-t-[#317873]" />
                    작성 중…
                  </span>}
                </div>
                {answer && <div className="whitespace-pre-line text-[13px] leading-relaxed text-[#2d4b45]">{answer}</div>}
                {!answer && generating && <div className="text-[13px] text-[#2d4b45]">컨텍스트를 바탕으로 답변을 준비하고 있어요…</div>}
              </div>
            )}

            {/* Empty hint */}
            {!loading && !emptyKB && hits.length === 0 && !generating && !answer && (
              <div className="text-gray-500">무엇이 궁금하신가요? (예: 운영 시간, 오시는 길, 프로그램)</div>
            )}

            {/* Sources (highlights) */}
            {!loading && hits.length > 0 && (
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
