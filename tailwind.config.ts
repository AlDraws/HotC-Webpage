import type { Config } from "tailwindcss";
import aspectRatio from "@tailwindcss/aspect-ratio";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hotc-orange': '#F26B2B',
        'hotc-cyan': '#1FB8D1',
        'hotc-magenta': '#E8336E',
        'hotc-black': '#0B0B0E',
        'hotc-cream': '#F5EFE6',
        'hotc-yellow': '#FFC233',
      },
      fontFamily: {
        bangers: ['var(--font-bangers)', 'cursive'],
        'comic-neue': ['var(--font-comic-neue)', 'cursive'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'comic': '6px 6px 0px 0px #0B0B0E',
      },
    },
  },
  plugins: [aspectRatio],
};

export default config;
