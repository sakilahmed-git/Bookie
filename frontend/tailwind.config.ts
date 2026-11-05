import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "Arial", "sans-serif"],
      },
      colors: {
        ink: "#25243A",
        muted: "#77768B",
        lavender: "#7668E8",
        lilac: "#F0EDFF",
        blush: "#FFF0F4",
        skywash: "#EDF7FF",
        mintwash: "#ECF8F2",
      },
      boxShadow: {
        soft: "0 18px 55px rgba(54, 48, 104, 0.08)",
        card: "0 8px 30px rgba(54, 48, 104, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
