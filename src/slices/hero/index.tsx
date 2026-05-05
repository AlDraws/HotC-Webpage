"use client";
import { Content } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero = ({ slice }: HeroProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={`hotc-hero hotc-hero--${slice.primary.size || "lg"}`}
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
        <PrismicRichText
          field={slice.primary.title}
          components={{
            heading1: ({ children }) => (
              <h1 className="hotc-hero__title">{children}</h1>
            ),
          }}
        />
        {slice.primary.subtitle && (
          <div className="hotc-hero__subtitle">
            <PrismicRichText field={slice.primary.subtitle} />
          </div>
        )}
        {(slice.primary.primary_cta_label || slice.primary.secondary_cta_label) && (
          <div className="hotc-hero__ctas">
            {slice.primary.primary_cta_label && (
              <PrismicNextLink
                field={slice.primary.primary_cta_link}
                className="hotc-btn hotc-btn--ember"
              >
                {slice.primary.primary_cta_label}
              </PrismicNextLink>
            )}
            {slice.primary.secondary_cta_label && (
              <PrismicNextLink
                field={slice.primary.secondary_cta_link}
                className="hotc-btn hotc-btn--ghost"
                style={{ color: "#fff" }}
              >
                {slice.primary.secondary_cta_label}
              </PrismicNextLink>
            )}
          </div>
        )}
      </Bounded>
    </section>
  );
};

export default Hero;
