import { useEffect, useMemo, useState } from "react";

function RoaLoadingPage(): JSX.Element {
  const [revealed, setRevealed] = useState(false);

  // 사용자 환경 설정 반영: 모션 감소
  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setRevealed(true);
      return;
    }
    const t = window.setTimeout(() => setRevealed(true), 650); // 부드러운 지연 후 리빌
    return () => window.clearTimeout(t);
  }, [reduceMotion]);

  return (
    <div className="relative min-h-screen craft-bg-rich text-[#3e372f] selection:bg-[#e0d5c0] selection:text-[#2d261f]">
      {/* 배경 앰비언스 */}

      {/* 은은한 떠다니는 입자 (가벼움 유지) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-10 top-24 h-2 w-2 rounded-full bg-[#7c6a55]/20 blur-[1px] motion-safe:animate-[float1_12s_ease-in-out_infinite]" />
        <div className="absolute right-10 top-10 h-1.5 w-1.5 rounded-full bg-[#7c6a55]/20 blur-[0.5px] motion-safe:animate-[float2_14s_ease-in-out_infinite]" />
        <div className="absolute left-16 bottom-24 h-1.5 w-1.5 rounded-full bg-[#7c6a55]/15 blur-[0.5px] motion-safe:animate-[float3_16s_ease-in-out_infinite]" />
        <style>{`
          @keyframes float1 { 0%,100%{ transform: translateY(0) translateX(0)} 50%{ transform: translateY(-8px) translateX(6px)} }
          @keyframes float2 { 0%,100%{ transform: translateY(0) translateX(0)} 50%{ transform: translateY(10px) translateX(-8px)} }
          @keyframes float3 { 0%,100%{ transform: translateY(0) translateX(0)} 50%{ transform: translateY(-6px) translateX(5px)} }
        `}</style>
      </div>

      {/* 내용 컨테이너 */}
      <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-16">
        <a
          href="#/"
          className="mb-6 self-start rounded text-sm text-[#6d5e4e] underline decoration-[#b49b7a] decoration-1 underline-offset-4 hover:text-[#4d4136] focus:outline-none focus:ring-2 focus:ring-[#c7b08c]/60"
        >
          ← 돌아가기
        </a>

        {/* 편지 카드 (크래프트지) */}
        <article
          aria-label="로아의 다락방 환영 편지"
          className={[
            "relative w-full rounded-[20px] border border-[#a88f6a]/30 bg-[#e7d8b1] p-7 sm:p-10 text-[#3a332a] shadow-[0_10px_30px_rgba(83,61,40,0.15)] font-handwrite min-h-[70vh]",
            "sm:text-base",
            // 리빌 애니메이션
            revealed
              ? "motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-[cubic-bezier(.22,1,.36,1)] motion-safe:opacity-100 motion-safe:translate-y-0"
              : "motion-safe:opacity-0 motion-safe:translate-y-2",
          ].join(" ")}
          style={{
            // 미세한 종이 섬유 느낌
            backgroundImage: [
              "repeating-linear-gradient(180deg, rgba(120,84,54,0.05) 0, rgba(120,84,54,0.05) 1px, rgba(255,241,210,0.03) 1px, rgba(255,241,210,0.03) 3px)",
            ].join(","),
            filter: revealed ? "none" : "blur(2.4px)",
          }}
        >
          {/* 내부 테두리, 상단 광택 */}
          <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-[#9f835e]/25" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-[20px] bg-white/4 mix-blend-soft-light" />

          <header className="mb-4">
            <h1 className="text-lg font-semibold tracking-tight text-[#3b2f23] sm:text-xl">
              로아의 다락방에 온 걸 환영해
            </h1>
          </header>

          <p
            className={[
              "whitespace-pre-line text-[32px] sm:text-[34px] leading-[2.4] sm:leading-[2.5] text-[#3a332a]/95",
              revealed
                ? "motion-safe:transition-[filter,opacity] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(.22,1,.36,1)] motion-safe:opacity-100"
                : "motion-safe:opacity-0",
              "motion-reduce:opacity-100",
            ].join(" ")}
          >
            {`안녕 로아의 다락방에 온 걸 환영해. 여기는 나와 관계된 관계자들이 모이는 곳이야.
이 곳에서는 나의 하루를 들춰볼 수 있어. 또한 하루하루 남기는 창작물들도 볼 수 있지.
이 곳에 온 걸 환영해. 너를 이곳으로 초대할게.

-이로아가-`}
          </p>
        </article>

      </main>
    </div>
  );
}

export default RoaLoadingPage;
