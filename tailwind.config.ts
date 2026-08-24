import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#1f1b16",
          700: "#3d3730",
          500: "#6b6459",
          400: "#8a8378",
        },
        paper: {
          50: "#faf8f4",
          100: "#f4f0e8",
          200: "#e8e2d5",
        },
        ember: {
          500: "#c2571b",
          600: "#a8480f",
          100: "#f9ecdf",
        },
        moss: {
          600: "#3b6d11",
          100: "#eaf3de",
        },
      },
      fontFamily: {
        serif: [
          "Noto Serif SC",
          "Songti SC",
          "SimSun",
          "Georgia",
          "serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(31, 27, 22, 0.06), 0 4px 14px rgba(31, 27, 22, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
