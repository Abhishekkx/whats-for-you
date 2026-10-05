import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FAF8F3",
          card: "#F4EFE6",
          hover: "#EFE8DC",
          border: "#E2DACB",
          darker: "#DDD3C1",
        },
        ink: {
          DEFAULT: "#1B1710",
          muted: "#6B655A",
          faint: "#A8A196",
        },
        stamp: {
          red: "#C2402A",
          redBg: "#FAECE9",
          redBorder: "#E8A79B",
          amber: "#B7791F",
          amberBg: "#FEF7E8",
          amberBorder: "#E4C68B",
          green: "#1E6B4A",
          greenBg: "#EBF5F0",
          greenBorder: "#96CEB4",
        },
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        stamp: "0 0 0 1px currentColor, inset 0 0 0 1px currentColor",
        subtle: "0 1px 3px rgba(27, 23, 16, 0.05)",
        card: "0 2px 8px rgba(27, 23, 16, 0.04), 0 1px 2px rgba(27, 23, 16, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
