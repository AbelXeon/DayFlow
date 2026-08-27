import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--text-muted)",
        accent: "var(--accent)",
        data: "var(--accent-data)",
      },
fontFamily: {
  display: ["var(--font-bebas)"],
  body: ["var(--font-inter)"],
  mono: ["var(--font-jetbrains)"],
},
    },
  },
  plugins: [],
};
export default config;