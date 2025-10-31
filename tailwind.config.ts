import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Pretendard", "ui-sans-serif", "system-ui"],
        serif: ["Noto Serif KR", "serif"],
      },
      keyframes: {
        // gentle diagonal drift with slight rotation (kept for optional use)
        float: {
          "0%": { transform: "translate(0, 0) rotate(0deg)" },
          "100%": { transform: "translate(-160px, -140px) rotate(360deg)" },
        },
        // orbit-style rotation around center (clockwise)
        orbitCW: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // orbit-style rotation around center (counter-clockwise)
        orbitCCW: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        // subtle large texture float (for optional texture layer)
        floatTexture: {
          "0%": { transform: "translate(0,0) rotate(0deg)" },
          "100%": { transform: "translate(-120px,-120px) rotate(360deg)" },
        },
        // central cluster: gentle vertical bob using per-dot amplitude via CSS var(--yAmp)
        bobY: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(calc(-1 * var(--yAmp, 32px)))" },
          "100%": { transform: "translateY(0)" },
        },
        bobYAlt: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(var(--yAmp, 32px))" },
          "100%": { transform: "translateY(0)" },
        },
        // subtle X sway (used standalone or combined feel)
        swayX: {
          "0%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(var(--xAmp, 12px))" },
          "100%": { transform: "translateX(0)" },
        },
        // weave: combine X sway with opposite-phase Y bob so paths cross near center
        weaveUp: {
          "0%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(var(--xAmp, 12px), calc(-1 * var(--yAmp, 32px)))" },
          "100%": { transform: "translate(0, 0)" },
        },
        weaveDown: {
          "0%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(calc(-1 * var(--xAmp, 12px)), var(--yAmp, 32px))" },
          "100%": { transform: "translate(0, 0)" },
        },
        // vertical flow: start offscreen and traverse straight through center (no X motion)
        flowDown: {
          "0%": { transform: "translateY(-60vh)" },
          "100%": { transform: "translateY(60vh)" },
        },
        flowUp: {
          "0%": { transform: "translateY(60vh)" },
          "100%": { transform: "translateY(-60vh)" },
        },
        // very subtle pulsing for optional central blob
        pulseSoft: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.02)" },
        },
        // print-like reveal from bottom
        revealUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // slower, longer reveal for program cards
        revealUpSlow: {
          "0%": { opacity: "0", transform: "translateY(36px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float20: "float 20s linear infinite",
        float30: "float 30s linear infinite",
        float40: "float 40s linear infinite",
        // clockwise orbits
        orbitCW20: "orbitCW 20s linear infinite",
        orbitCW30: "orbitCW 30s linear infinite",
        orbitCW40: "orbitCW 40s linear infinite",
        orbitCW60: "orbitCW 60s linear infinite",
        orbitCW90: "orbitCW 90s linear infinite",
        orbitCW120: "orbitCW 120s linear infinite",
        orbitCW150: "orbitCW 150s linear infinite",
        orbitCW180: "orbitCW 180s linear infinite",
        orbitCW240: "orbitCW 240s linear infinite",
        // counter-clockwise (kept for potential reuse)
        orbitCCW20: "orbitCCW 20s linear infinite",
        orbitCCW30: "orbitCCW 30s linear infinite",
        orbitCCW40: "orbitCCW 40s linear infinite",
        orbitCCW60: "orbitCCW 60s linear infinite",
        // central cluster bobbing presets (motion-safe in JSX)
        bobY28: "bobY 28s linear infinite",
        bobY36: "bobY 36s linear infinite",
        bobY48: "bobY 48s linear infinite",
        bobY60: "bobY 60s linear infinite",
        bobY72: "bobY 72s linear infinite",
        bobYAlt28: "bobYAlt 28s linear infinite",
        bobYAlt36: "bobYAlt 36s linear infinite",
        bobYAlt48: "bobYAlt 48s linear infinite",
        bobYAlt60: "bobYAlt 60s linear infinite",
        bobYAlt72: "bobYAlt 72s linear infinite",
        // subtle X sway
        swayX48: "swayX 48s linear infinite",
        swayX60: "swayX 60s linear infinite",
        swayX72: "swayX 72s linear infinite",
        // weave presets (opposite-phase crossings)
        weaveUp36: "weaveUp 36s linear infinite",
        weaveUp48: "weaveUp 48s linear infinite",
        weaveUp60: "weaveUp 60s linear infinite",
        weaveUp72: "weaveUp 72s linear infinite",
        weaveUp84: "weaveUp 84s linear infinite",
        weaveDown36: "weaveDown 36s linear infinite",
        weaveDown48: "weaveDown 48s linear infinite",
        weaveDown60: "weaveDown 60s linear infinite",
        weaveDown72: "weaveDown 72s linear infinite",
        weaveDown84: "weaveDown 84s linear infinite",
        // vertical flow presets (no X motion)
        flowDown36: "flowDown 36s linear infinite",
        flowDown48: "flowDown 48s linear infinite",
        flowDown60: "flowDown 60s linear infinite",
        flowDown72: "flowDown 72s linear infinite",
        flowDown84: "flowDown 84s linear infinite",
        flowDown96: "flowDown 96s linear infinite",
        flowUp36: "flowUp 36s linear infinite",
        flowUp48: "flowUp 48s linear infinite",
        flowUp60: "flowUp 60s linear infinite",
        flowUp72: "flowUp 72s linear infinite",
        flowUp84: "flowUp 84s linear infinite",
        flowUp96: "flowUp 96s linear infinite",
        floatTexture30: "floatTexture 30s linear infinite",
        pulseSoft: "pulseSoft 6s ease-in-out infinite alternate",
        revealUp: "revealUp 560ms cubic-bezier(0.22,0.61,0.36,1) forwards",
        revealUpSlow: "revealUpSlow 1200ms cubic-bezier(0.22,0.61,0.36,1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
