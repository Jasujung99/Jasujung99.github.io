import React, { useEffect, useRef } from "react";

// Mixed animation background: warm gradient + orbiting dots (emphasized) + central sun glow
// - Tailwind keyframes used: orbitCW, floatTexture, pulseSoft
// - Respects prefers-reduced-motion via motion-safe utilities

export type AnimatedBackgroundProps = {
  className?: string;
};

export default function AnimatedBackground({ className = "" }: AnimatedBackgroundProps) {
  // 링 설정: 반지름은 vw 단위(풀블리드 유지), 간격(간섭)을 줄이기 위해 개수 증가
  // baseSize/alpha는 도트별 지터를 적용하여 밝기/크기 변화를 줌
  const rings = [
    { radius: "24vw", count: 24, baseSize: 40, baseAlpha: 0.18, anim: "motion-safe:animate-orbitCW120" },
    { radius: "36vw", count: 32, baseSize: 46, baseAlpha: 0.16, anim: "motion-safe:animate-orbitCW150" },
    { radius: "50vw", count: 40, baseSize: 52, baseAlpha: 0.14, anim: "motion-safe:animate-orbitCW240" },
  ];

  // 유틸: 0..1 난수 유사값(인덱스 기반 결정적), clamp
  const uhash = (n: number) => Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // 패럴랙스 레이어 refs
  const textureRef = useRef<HTMLDivElement | null>(null);
  const orbitRef = useRef<HTMLDivElement | null>(null);
  const sunRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let raf = 0;
    let current = 0; // 0..1 (progress)
    let target = 0;  // 0..1 (progress)
    const maxShift = 36; // px cap
    const maxRot = 6; // deg

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const computeProgress = () => {
      const vh = window.innerHeight || 1;
      const y = window.scrollY || 0;
      // 가상 스크롤 진행도: 0.2vh에서 시작해 0.8vh에서 1에 도달(더 일찍/부드럽게 등장)
      const raw = (y - vh * 0.2) / (vh * 0.6);
      const clamped = Math.max(0, Math.min(1, raw));
      return easeOutCubic(clamped);
    };

    const onScroll = () => {
      target = computeProgress();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      // 부드러운 관성 보간
      current += (target - current) * 0.12;
      const shift = maxShift * current;
      const rot = maxRot * current;

      if (textureRef.current) {
        textureRef.current.style.willChange = 'transform';
        textureRef.current.style.transform = `translate3d(0, ${shift * 0.5}px, 0) rotate(${rot}deg)`;
      }
      if (orbitRef.current) {
        orbitRef.current.style.willChange = 'transform';
        orbitRef.current.style.transform = `translateY(${shift}px) rotate(${rot}deg)`;
        // 도트는 항상 선명하게 보이도록 불투명도 고정
        orbitRef.current.style.opacity = "1";
      }
      if (sunRef.current) {
        sunRef.current.style.willChange = 'opacity';
        // 태양은 기본도 보이게: 0.25 → 최대 0.50 범위
        sunRef.current.style.opacity = String(Math.min(0.5, 0.25 + 0.25 * current));
      }

      if (Math.abs(target - current) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
    // 초기값 설정
    target = computeProgress();
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll as any);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className={[
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        // warm gradient base (full-bleed)
        "bg-[linear-gradient(135deg,#efe7dc_0%,#e6dac8_100%),_radial-gradient(1200px_600px_at_10%_10%,#efe3d4_0%,transparent_60%),_radial-gradient(900px_600px_at_90%_0%,#ecdcc9_0%,transparent_55%)]",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      {/* Texture layer (sample-inspired): slow float+rotate of a subtle SVG pattern */}
      <div
        ref={textureRef}
        className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%] opacity-[0.06] motion-safe:animate-floatTexture30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.16'%3E%3Cpath d='M30 30m-10 0a10 10 0 1 1 20 0a10 10 0 1 1 -20 0'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />

      {/* 중앙 고정 "태양" — 단일 레이어(단순화), 공전 아래에 위치 */}
      <div
        ref={sunRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-0"
        style={{
          width: "58vmin",
          height: "58vmin",
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.28) 60%, rgba(255,255,255,0.12) 80%, transparent 100%)",
          filter: "blur(14px)",
          opacity: 0, // parallax로 서서히 드러남
        }}
      />

      {/* 공전 링: 중심 기준으로 링을 여러 개 배치 (시계방향, 느리게) */}
      <div ref={orbitRef} className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2">
        {rings.map((ring, ridx) => (
          <div key={`ring-${ridx}`} className={["relative h-0 w-0", ring.anim].join(" ")}>{
            Array.from({ length: ring.count }).map((_, i) => {
              const deg = (360 / ring.count) * i;
              const seed = (ridx + 1) * 1000 + (i + 1);
              const r = uhash(seed); // 0..1
              const size = Math.round(ring.baseSize * (0.85 + 0.3 * r)); // ±15%
              const alpha = clamp(ring.baseAlpha + (r - 0.5) * 0.08, 0.06, 0.22); // ±0.04, 범위 제한
              const blurPx = Math.round(0 + 2 * r); // 0~2px 살짝
              return (
                <span
                  key={`r${ridx}-d${i}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: `rgba(255,255,255,${alpha})`,
                    transform: `rotate(${deg}deg) translateX(${ring.radius})`,
                    filter: blurPx ? `blur(${blurPx}px)` : undefined,
                  }}
                />
              );
            })
          }</div>
        ))}
      </div>
    </div>
  );
}
