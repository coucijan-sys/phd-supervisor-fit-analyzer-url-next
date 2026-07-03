import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1b1f23",
        paper: "#f7f7f4",
        line: "#d9ddd6",
        moss: "#3f5f4a",
        steel: "#3b5363",
        ochre: "#a56b31"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(27, 31, 35, 0.08)"
      }
    }
  },
  plugins: [typography]
};

export default config;
