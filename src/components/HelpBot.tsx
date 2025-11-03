import React, { useEffect, useMemo, useRef, useState } from "react";

// Small floating Q&A bot for quick help
// - Fixed button bottom-right
// - Click opens a compact chat-like panel
// - Local FAQ keyword matcher (Korean)
// - Accessible: dialog semantics, ESC to close, focus management
// - No external dependencies

export type HelpBotProps = {
  className?: string;
};

type Msg = { sender: "bot" | "user"; text: string };

type KBItem = {
  id: string;
  q: string;
  a: string;
  keywords: string[]; // lowercased keywords to match
};

const LINKS = {
  place: "https://m.place.naver.com/place/1283919586/home",
  blog: "https://blog.naver.com/haeumkorean",
  talk: "https://talk.naver.com/W7AQRM9",
};

const KB: KBItem[] = [
  {
    id: "location",
    q: "위치/오시는 길",
    a:
      `해움한국어 위치와 운영 정보는 네이버 스마트플레이스에서 확인하실 수 있어요.\n` +
      `스마트플레이스: ${LINKS.place}\n` +
      `빠른 문의는 네이버 톡톡을 이용해 주세요: ${LINKS.talk}`,
    keywords: ["위치", "오시는", "찾아오", "주소", "어디", "길"],
  },
  {
    id: "programs",
    q: "프로그램/수업",
    a:
      `교육/시험 대비, 생활한국어, 문화체험 등 다양한 프로그램을 운영합니다.\n` +
      `홈 상단의 ‘프로그램 안내’ 섹션을 확인해 주세요. 궁금하신 점은 톡톡으로 문의하시면 빠르게 도와드려요. ${LINKS.talk}`,
    keywords: ["프로그램", "수업", "강의", "커리큘럼", "TOPIK", "KIIP", "시험", "회화"],
  },
  {
    id: "subscribe",
    q: "소식 구독",
    a:
      `홈페이지 ‘문의 및 참여’ 섹션에서 이메일을 입력하고 ‘소식 받기’를 누르면 구독이 완료돼요.\n` +
      `안내/오류가 있으면 잠시 후 다시 시도하거나, 톡톡으로 문의해 주세요: ${LINKS.talk}`,
    keywords: ["소식", "구독", "뉴스", "이메일", "알림"],
  },
  {
    id: "hours",
    q: "운영시간/연락",
    a:
      `운영 일정은 상황에 따라 조정될 수 있어요. 네이버 스마트플레이스에 최신 정보가 반영됩니다: ${LINKS.place}\n` +
      `빠른 연락: 네이버 톡톡 ${LINKS.talk}`,
    keywords: ["운영", "시간", "연락", "전화", "문의", "상담"],
  },
  {
    id: "community",
    q: "해움한국어는 어떤 곳인가요?",
    a:
      `“언어로 만나는 따뜻한 공동체”를 지향하는 열린 배움터입니다.\n` +
      `인문학·예술·소통을 통해 서로를 이해하고 마주하는 공간을 만듭니다.\n` +
      `더 알아보기: 블로그 ${LINKS.blog}`,
    keywords: ["해움", "소개", "무엇", "어떤", "철학", "공동체"],
  },
];

function score(query: string, item: KBItem): number {
  const q = query.toLowerCase();
  let s = 0;
  for (const k of item.keywords) {
    if (!k) continue;
    if (q.includes(k)) s += 2; // direct keyword
  }
  // exact name boost
  if (q.includes("해움") || q.includes("해움한국어")) s += 1;
  return s;
}

function bestAnswer(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  // heuristic: try to normalize spacing
  const normalized = trimmed.replace(/\s+/g, " ");
  let best: KBItem | null = null;
  let bestScore = 0;
  for (const item of KB) {
    const sc = score(normalized, item);
    if (sc > bestScore) {
      bestScore = sc;
      best = item;
    }
  }
  if (best && bestScore > 0) return best.a;
  return null;
}

export default function HelpBot({ className = "" }: HelpBotProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  }, []);

  // Open → greet message and focus input
  useEffect(() => {
    if (open) {
      // greet once when opening with no messages
      if (messages.length === 0) {
        setMessages([
          { sender: "bot", text: "무엇이 궁금하신가요? 아래에 질문을 입력해 주세요." },
          { sender: "bot", text: "예: 위치/오시는 길, 프로그램/수업, 소식 구독, 운영 시간 등" },
        ]);
      }
      // focus
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const p = panelRef.current;
      if (!p) return;
      const target = e.target as Node;
      if (!p.contains(target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function send() {
    const q = input.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    setInput("");

    // find answer
    const ans = bestAnswer(q);
    if (ans) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: ans }]);
      }, 120);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text:
              "정확한 답을 찾지 못했어요. 아래 채널로 문의하시면 빠르게 도와드릴게요!\n" +
              `- 네이버 톡톡: ${LINKS.talk}\n` +
              `- 스마트플레이스: ${LINKS.place}\n` +
              `- 블로그: ${LINKS.blog}`,
          },
        ]);
      }, 120);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        aria-label={open ? "도움말 닫기" : "도움말 열기"}
        onClick={() => setOpen((v) => !v)}
        className={[
          "fixed right-4 bottom-4 z-50 rounded-full shadow-lg border border-[#317873]/20",
          "bg-[#317873] text-white hover:bg-[#285f5b] focus:outline-none focus:ring-2 focus:ring-[#9bd5c7]",
          "h-11 w-11 flex items-center justify-center",
          className,
        ].join(" ")}
        style={{
          // avoid iOS home indicator
          marginBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          transition: reduceMotion ? undefined : "transform 160ms ease, background-color 160ms ease",
        }}
        onMouseDown={(e) => {
          // prevent focus loss flicker when clicking to open
          e.preventDefault();
        }}
      >
        {/* bot icon (SVG) */}
        {!open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M11 2a1 1 0 1 1 2 0v1.06A8.002 8.002 0 0 1 20 11v3.5a3.5 3.5 0 0 1-3.5 3.5H7.5A3.5 3.5 0 0 1 4 14.5V11a8.002 8.002 0 0 1 7-7.94V2z"/>
            <circle cx="9" cy="11" r="1.5" fill="#ffffff"/>
            <circle cx="15" cy="11" r="1.5" fill="#ffffff"/>
          </svg>
        ) : (
          // close icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M6.225 4.811 4.811 6.225 9.586 11l-4.775 4.775 1.414 1.414L11 12.414l4.775 4.775 1.414-1.414L12.414 11l4.775-4.775-1.414-1.414L11 9.586 6.225 4.811z"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      <div
        role="dialog"
        aria-modal={open ? true : false}
        aria-label="해움 도움말"
        className={["fixed right-4 z-50", open ? "pointer-events-auto" : "pointer-events-none"].join(" ")}
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.25rem)",
          width: "min(calc(100vw - 24px), 360px)",
        }}
      >
        <div
          ref={panelRef}
          className={[
            "rounded-xl border border-black/10 bg-white shadow-2xl",
            open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          ].join(" ")}
          style={{
            transition: reduceMotion ? undefined : "opacity 220ms ease, transform 220ms ease",
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#285f5b]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#317873]/10 text-[#317873]">
                {/* tiny bot head */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M11 2a1 1 0 1 1 2 0v1.06A8.002 8.002 0 0 1 20 11v3.5a3.5 3.5 0 0 1-3.5 3.5H7.5A3.5 3.5 0 0 1 4 14.5V11a8.002 8.002 0 0 1 7-7.94V2z"/>
                </svg>
              </span>
              <span>무엇이 궁금하신가요?</span>
            </div>
            <button
              type="button"
              className="rounded p-1 text-[#666] hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#9bd5c7]"
              onClick={() => setOpen(false)}
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M6.225 4.811 4.811 6.225 9.586 11l-4.775 4.775 1.414 1.414L11 12.414l4.775 4.775 1.414-1.414L12.414 11l4.775-4.775-1.414-1.414L11 9.586 6.225 4.811z"/>
              </svg>
            </button>
          </div>

          {/* messages */}
          <div className="max-h-[60vh] overflow-auto px-4 py-3 text-[13px] leading-relaxed text-[#333]">
            {messages.map((m, idx) => (
              <div key={idx} className={m.sender === "bot" ? "mb-2" : "mb-2 text-right"}>
                {m.sender === "bot" ? (
                  <div className="inline-block rounded-lg bg-[#f3fbf9] px-3 py-2 text-[#285f5b] ring-1 ring-[#317873]/15 whitespace-pre-line">
                    {m.text}
                  </div>
                ) : (
                  <div className="inline-block rounded-lg bg-[#f7f4ef] px-3 py-2 text-[#3a332a] whitespace-pre-line">
                    {m.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* input */}
          <div className="flex items-end gap-2 border-t border-black/5 p-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="질문을 입력해 보세요"
              rows={1}
              className="min-h-[38px] max-h-28 w-full resize-y rounded-md border border-black/10 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#9bd5c7]"
              aria-label="질문 입력"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim()}
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-[#317873] px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#285f5b] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="전송"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
