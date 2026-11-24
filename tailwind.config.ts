import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171827",
        brand: { DEFAULT: "#625BFF", dark: "#4F48E6", violet: "#8B5CF6" },
        lavender: "#F2F0FF",
        surface: "#F7F8FC",
        text: { DEFAULT: "#25263A", muted: "#77798D" },
        success: "#39C6A5",
        line: "#E8E9F1",
        danger: "#D64560",
      },
      fontFamily: {
        heading: ["var(--font-manrope)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: { card: "0 1px 2px rgba(23,24,39,.04), 0 8px 24px rgba(23,24,39,.06)" },
    },
  },
  plugins: [],
};
export default config;
