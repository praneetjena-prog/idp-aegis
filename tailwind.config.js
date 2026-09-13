/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg: "#0B0E14",
          surface: "#121721",
          border: "#1E2638",
          borderLight: "#26324D",
          cyan: "#0EA5E9",
          teal: "#14B8A6",
          green: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
          muted: "#94A3B8"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
}
