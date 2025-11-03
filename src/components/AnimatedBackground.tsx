import React, { useEffect, useRef } from "react";

// Mixed animation background: warm gradient + orbiting dots (emphasized) + central sun glow
// - Tailwind keyframes used: orbitCW, floatTexture, pulseSoft, bobY/bobYAlt
// - Respects prefers-reduced-motion via motion-safe utilities

export type AnimatedBackgroundProps = {
  className?: string;
};

// 튜닝 파라미터 (빠른 감성 조정용)
const CLUSTER_COUNT = 30; // 24~36 권장
const SIZE_MIN = 18;
const SIZE_MAX = 72;
const ALPHA_MIN = 0.06; // 더 은은하게
const ALPHA_MAX = 0.18; // 더 연하게
const RADIUS_MIN = 20; // px
const RADIUS_MAX = 160; // px
const DURATION_SET = [36, 48, 60, 72, 84, 96] as const; // vertical flow reference set
const DELAY_MAX = 8; // s (wider phase spread)
// 수직 플로우만 사용하므로 Y/X 앰플리튜드/코호트 파라미터는 미사용
const Y_AMPLITUDE_MIN = 24; // px (legacy, 미사용)
const Y_AMPLITUDE_MAX = 56; // px (legacy, 미사용)
const X_AMPLITUDE_MIN = 8; // px (legacy, 미사용)
const X_AMPLITUDE_MAX = 16; // px (legacy, 미사용)
const COUNT_WEAVE_RATIO = 0.0; // weave 미사용
const BLUR_MAX = 2; // px
const X_BAND_PX = 160; // 중심 기준 좌우 밴드 폭

export default function AnimatedBackground({ className = "" }: AnimatedBackgroundProps) {
  // 링 설정: 반지름은 vw 단위(풀블리드 유지), 간격(간섭)을 줄이기 위해 개수 증가
  // baseSize/alpha는 도트별 지터를 적용하여 밝기/크기 변화를 줌
  // rings: defined responsively below

  // 유틸: 0..1 난수 유사값(인덱스 기반 결정적), clamp
  const uhash = (n: number) => Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // 패럴랙스 레이어 refs
  const textureRef = useRef<HTMLDivElement | null>(null);
  const orbitRef = useRef<HTMLDivElement | null>(null);
  const sunRef = useRef<HTMLDivElement | null>(null);
  const clusterRef = useRef<HTMLDivElement | null>(null);

  // Responsive config: adjust density/size/spread around 900px to avoid overlap on narrow screens
  const [vw, setVw] = React.useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true } as AddEventListenerOptions);
    return () => window.removeEventListener('resize', onResize as any);
  }, []);
  const isOrbitDisabled = vw < 1024; // 1024px 미만에서는 공전 링만 비활성화
  const isNarrow = vw < 1024; // 1024px 기준으로 클러스터 파라미터도 조정(요청사항 반영)

  // Cluster (free-flow dots) responsive parameters (≤1024px: 살짝 부각)
  const clusterCount = isNarrow ? 18 : 30; // 좁은 화면에서도 적당한 존재감 유지
  const sizeMin = isNarrow ? 14 : 18;
  const sizeMax = isNarrow ? 54 : 72; // 약간 크게(과하지 않게)
  const alphaMin = isNarrow ? 0.08 : 0.06; // 살짝 더 선명
  const alphaMax = isNarrow ? 0.20 : 0.18; // 상한도 조금 상향
  const blurMax = isNarrow ? 1 : 2; // 좁을수록 더 또렷하게
  const xBandPx = isNarrow ? Math.max(140, Math.round(vw * 0.22)) : 160; // 좁을수록 가로 분산 확대
  const delayMax = isNarrow ? 6 : 8;

  // Flow duration pools (weighted). Narrow screens favor longer cycles to reduce visual noise
  const flowDurationPool: number[] = isNarrow
    ? [
        48, 48,
        60, 60, 60,
        72, 72, 72,
        84, 84,
      ]
    : [
        36,
        48, 48,
        60, 60, 60,
        72, 72, 72, 72,
        84, 84, 84, 84, 84,
        96, 96, 96, 96, 96, 96,
      ];

  // Orbit ring config — disable orbit rings below 1024px; keep central vertical-flow dots alive
  const rings = isOrbitDisabled
    ? []
    : [
        { radius: '24vw', count: 24, baseSize: 40, baseAlpha: 0.18, anim: 'motion-safe:animate-orbitCW120' },
        { radius: '36vw', count: 32, baseSize: 46, baseAlpha: 0.16, anim: 'motion-safe:animate-orbitCW150' },
        { radius: '50vw', count: 40, baseSize: 52, baseAlpha: 0.14, anim: 'motion-safe:animate-orbitCW240' },
      ];

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let raf = 0;
    let current = 0; // 0..1 (progress)
    let target = 0;  // 0..1 (progress)
    const maxShift = 36; // px cap (기존 레이어 기준)
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
      const shift = maxShift * current; // 0..36
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
      if (clusterRef.current) {
        // 수직 플로우와의 충돌을 피하기 위해 패럴랙스는 비활성화(더 은은하게)
        clusterRef.current.style.willChange = 'opacity';
        clusterRef.current.style.transform = '';
        clusterRef.current.style.opacity = "1"; // 선명도 유지
      }
      if (sunRef.current) {
        sunRef.current.style.willChange = 'opacity';
        // 태양은 기본도 보이게: 0.35 → 최대 0.60 범위
        sunRef.current.style.opacity = String(Math.min(0.6, 0.35 + 0.25 * current));
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
          width: "62vmin",
          height: "62vmin",
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.34) 58%, rgba(255,255,255,0.16) 78%, transparent 100%)",
          filter: "blur(16px)",
          opacity: 0, // parallax로 서서히 드러남 (기본은 useEffect에서 0.35로 시작)
        }}
      />

      {/* 중앙 클러스터: 중심 부근에 부유하는 도트 그룹 (Up/Down 교차 bobbing) */}
      <div ref={clusterRef} className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2">
        {Array.from({ length: clusterCount }).map((_, i) => {
          const r1 = uhash(5000 + i); // 위치/크기
          const r2 = uhash(7000 + i); // 지터/알파
          const r3 = uhash(9000 + i); // 애니 방향/블러
          const r4 = uhash(11000 + i); // 딜레이
          const r5 = uhash(13000 + i); // 앰플리튜드
          const r6 = uhash(15000 + i); // 코호트(weave 여부)

          // 수직 플로우 전용: X는 중앙 밴드 내에서 고정, Y는 키프레임으로 오프스크린↔오프스크린 이동
          const x = Math.round((uhash(16000 + i) * 2 - 1) * xBandPx);

          // 크기: 18~72px 범위 + ±25% 지터 (클램프)
          const baseSize = sizeMin + r1 * (sizeMax - sizeMin);
          const jitter = 0.75 + 0.5 * r2; // 0.75~1.25
          const size = Math.round(clamp(baseSize * jitter, sizeMin, sizeMax));

          // 알파: 더 은은한 범위 0.06~0.18
          const alpha = clamp(alphaMin + (r3 * (alphaMax - alphaMin)), alphaMin, alphaMax);

          // blur: 0~2px
          const blurPx = Math.round(blurMax * r3);

          // duration: 긴 주기 가중치 풀에서 선택
          const poolIdx = Math.floor(r1 * flowDurationPool.length) % flowDurationPool.length;
          const duration = flowDurationPool[poolIdx] as 36|48|60|72|84|96;

          // delay: 0~8s (넓은 분산)
          const delaySec = +(delayMax * r4).toFixed(2);

          // 방향: 절반은 위→아래(flowDown), 절반은 아래→위(flowUp)
          const goDown = r6 < 0.5;

          // Tailwind JIT 포함을 위해 모든 후보를 명시
          const flowUpClasses: Record<36|48|60|72|84|96, string> = {
            36: "motion-safe:animate-flowUp36",
            48: "motion-safe:animate-flowUp48",
            60: "motion-safe:animate-flowUp60",
            72: "motion-safe:animate-flowUp72",
            84: "motion-safe:animate-flowUp84",
            96: "motion-safe:animate-flowUp96",
          };
          const flowDownClasses: Record<36|48|60|72|84|96, string> = {
            36: "motion-safe:animate-flowDown36",
            48: "motion-safe:animate-flowDown48",
            60: "motion-safe:animate-flowDown60",
            72: "motion-safe:animate-flowDown72",
            84: "motion-safe:animate-flowDown84",
            96: "motion-safe:animate-flowDown96",
          };
          const animClass = (goDown ? flowDownClasses : flowUpClasses)[duration];

          return (
            <span
              key={`cluster-${i}`}
              className={["absolute -translate-x-1/2 -translate-y-1/2 rounded-full", animClass].join(" ")}
              style={{
                left: `${x}px`,
                top: `0px`,
                width: `${size}px`,
                height: `${size}px`,
                background: `rgba(255,255,255,${alpha})`,
                // per-dot animation delay using inline style
                animationDelay: `${delaySec}s`,
                filter: blurPx ? `blur(${blurPx}px)` : undefined,
                willChange: 'transform',
              } as React.CSSProperties}
            />
          );
        })}
      </div>

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
