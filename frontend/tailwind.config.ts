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
        background: "#0b0f19",
        surface: "#111827",
        card: "#1f2937",
        border: "#374151",
        accent: {
          DEFAULT: "#10b981",
          hover: "#059669",
          light: "#34d399",
          glow: "rgba(16, 185, 129, 0.15)",
        },
        danger: {
          DEFAULT: "#ef4444",
          hover: "#dc2626",
        },
        warning: {
          DEFAULT: "#f59e0b",
          hover: "#d97706",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 20px rgba(16, 185, 129, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
