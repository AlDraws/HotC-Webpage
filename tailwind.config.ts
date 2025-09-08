import type { Config } from "tailwindcss";
import aspectRatio from "@tailwindcss/aspect-ratio";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "hotc-marquee",
    "hotc-marquee--right",
    "hotc-hover-pause",
  ],
  plugins: [aspectRatio],
};

export default config;
