import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#8B5CF6",
          indigo: "#6366F1",
          yellow: "#F59E0B",
          emerald: "#10B981",
          coral: "#EF4444",
          slateDark: "#0F172A",
          slateCard: "#1E293B",
          slateBorder: "#334155",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
      },
      animation: {
        "caret-blink": "caretBlink 1s ease-in-out infinite",
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        caretBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
