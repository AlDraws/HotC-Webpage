"use client";
import { PrismicNextLink } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { HeroSlice } from "@/../prismicio-types";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero = ({ slice }: HeroProps) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hotc-hero hotc-hero--lg"
    >
      {slice.primary.image.url && (
        <div
          className="hotc-hero__bg"
          style={{ backgroundImage: `url(${slice.primary.image.url})` }}
        />
      )}
      <div className="hotc-hero__overlay" />
      <Bounded className="hotc-hero__inner" yPadding="none">
        {slice.primary.kicker && (
          <span className="hotc-kicker hotc-hero__kicker">
            {slice.primary.kicker}
          </span>
        )}
        {slice.primary.title && (
          <h1 className="hotc-hero__title">{slice.primary.title}</h1>
        )}
        {slice.primary.subtitle && (
          <div className="hotc-hero__subtitle">
            <p>{slice.primary.subtitle}</p>
          </div>
        )}
        {slice.primary.cta_label && (
          <div className="hotc-hero__ctas">
            <PrismicNextLink
              field={slice.primary.cta_link}
              className="hotc-btn hotc-btn--ember"
            >
              {slice.primary.cta_label}
            </PrismicNextLink>
          </div>
        )}
      </Bounded>
    </section>
  );
};

export default Hero;
