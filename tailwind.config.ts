import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      mono: ["var(--font-mono)", "monospace"],
    },
    extend: {
      colors: {
        cricket: {
          pitch: "#2d5a27",
          sky: "#0a0e1a",
          ball: "#dc2626",
          gold: "#f59e0b",
          field: "#16a34a",
        },
        surface: {
          DEFAULT: "rgba(22, 23, 26, 0.92)",
          light: "rgba(255, 255, 255, 0.04)",
          lighter: "rgba(255, 255, 255, 0.07)",
          border: "rgba(255, 255, 255, 0.08)",
          "border-light": "rgba(255, 255, 255, 0.12)",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-up": "fadeUp 0.6s ease-out",
        shimmer: "shimmer 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      backdropBlur: {
        glass: "25px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-gold":
          "linear-gradient(97deg, #f59e0b 0%, rgba(245,158,11,0.5) 100%)",
        "gradient-border":
          "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
        "gradient-surface":
          "linear-gradient(96deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
