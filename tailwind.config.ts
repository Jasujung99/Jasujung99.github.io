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
