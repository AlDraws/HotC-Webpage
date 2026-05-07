import { PrismicNextLink } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import PrismicImage from "@/components/PrismicImage";
import { HeroSlice } from "@/../prismicio-types";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero = ({ slice }: HeroProps) => {
  const primary = slice.primary as HeroSlice["primary"] & {
    background_image?: HeroSlice["primary"]["image"];
    bgImage?: HeroSlice["primary"]["image"];
    hero_image?: HeroSlice["primary"]["image"];
  };
  const heroImage =
    (primary.image?.url ? primary.image : null) ??
    (primary.background_image?.url ? primary.background_image : null) ??
    (primary.bgImage?.url ? primary.bgImage : null) ??
    (primary.hero_image?.url ? primary.hero_image : null);
  const heroTitle = primary.title?.trim() || "Heirs of the Collapse hero artwork";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hotc-hero hotc-hero--lg"
    >
      {heroImage?.url && (
        <div className="hotc-hero__bg">
          <PrismicImage
            field={heroImage}
            fallbackAlt={heroTitle}
            fill
            sizes="100vw"
            decoding="sync"
            preload={true}
            fetchPriority="high"
            loading="eager"
            className="hotc-hero__bg-img"
          />
        </div>
      )}
      <div className="hotc-hero__overlay" />
      <Bounded className="hotc-hero__inner" yPadding="none">
        {primary.kicker && (
          <span className="hotc-kicker hotc-hero__kicker">
            {primary.kicker}
          </span>
        )}
        {primary.title && (
          <h1 className="hotc-hero__title">{primary.title}</h1>
        )}
        {primary.subtitle && (
          <div className="hotc-hero__subtitle">
            <p>{primary.subtitle}</p>
          </div>
        )}
        {primary.cta_label && (
          <div className="hotc-hero__ctas">
            <PrismicNextLink
              field={primary.cta_link}
              className="hotc-btn hotc-btn--ember"
            >
              {primary.cta_label}
            </PrismicNextLink>
          </div>
        )}
      </Bounded>
    </section>
  );
};

export default Hero;
