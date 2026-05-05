import dynamic from "next/dynamic";

export const components = {
  external_support: dynamic(() => import("./external_support")),
  image_ticker: dynamic(() => import("./image_ticker")),
  parallax_hero: dynamic(() => import("./parallax_hero")),
  episode_panel: dynamic(() => import("./episode_panel")),
  episode_text_beat: dynamic(() => import("./episode_text_beat")),
  episode_divider: dynamic(() => import("./episode_divider")),
};
