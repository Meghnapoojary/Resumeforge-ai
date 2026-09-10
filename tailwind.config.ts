import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF3FA",
        ink: {
          DEFAULT: "#0E1B33",
          soft: "#3C4C6B",
          faint: "#8A97B3",
        },
        accent: {
          DEFAULT: "#2255D8",
          soft: "#B9CCF5",
          deep: "#123A9E",
        },
        cyan: {
          DEFAULT: "#0EA5C4",
        },
        rule: "#D4DEF0",
      },
      fontFamily: {
        display: ["'Source Serif 4'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        paper: "0 1px 0 rgba(14,27,51,0.05), 0 16px 32px -16px rgba(14,27,51,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
