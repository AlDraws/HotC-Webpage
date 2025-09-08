import type { Config } from "tailwindcss";
import aspectRatio from "@tailwindcss/aspect-ratio";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [aspectRatio],
};

export default config;
