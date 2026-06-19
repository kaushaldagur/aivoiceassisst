import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nova: {
          bg: "#090b12",
          panel: "rgba(15, 23, 42, 0.68)",
          border: "rgba(148, 163, 184, 0.18)"
        }
      },
      boxShadow: {
        glow: "0 24px 80px rgba(56, 189, 248, 0.16)"
      }
    }
  },
  plugins: []
} satisfies Config;
