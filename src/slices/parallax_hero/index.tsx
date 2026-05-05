import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `ParallaxHero`.
 */
export type ParallaxHeroProps = SliceComponentProps<Content.ParallaxHeroSlice>;

/**
 * Component for "ParallaxHero" Slices.
 */
const ParallaxHero = ({ slice }: ParallaxHeroProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for parallax_hero (variation: {slice.variation}) Slices
    </section>
  );
};

export default ParallaxHero;
