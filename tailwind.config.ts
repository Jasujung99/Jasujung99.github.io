import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Pretendard", "ui-sans-serif", "system-ui"],
        serif: ["Noto Serif KR", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
