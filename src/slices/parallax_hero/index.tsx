"use client";

import { isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import { CSSProperties, useEffect, useRef } from "react";
import { ParallaxHeroSlice } from "@/../prismicio-types";

export type ParallaxHeroProps = SliceComponentProps<ParallaxHeroSlice>;

/**
 * ParallaxHero
 */
const ParallaxHero = ({ slice }: ParallaxHeroProps) => {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const primary = slice.primary as { height_vh?: number | null };
  const customHeightVh =
    typeof primary.height_vh === "number" &&
    Number.isFinite(primary.height_vh) &&
    primary.height_vh > 0
      ? Math.min(primary.height_vh, 100)
      : null;
  const style: CSSProperties | undefined = customHeightVh
    ? ({ "--hotc-phero-height": `${customHeightVh}vh` } as CSSProperties)
    : undefined;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    if (reduce || small) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const bg = bgRef.current;
        if (!bg) return;
        const rect = bg.getBoundingClientRect();
        const offset = Math.max(-rect.top, 0);
        const translate = Math.min(offset * 0.12, 48);
        bg.style.transform = `translate3d(0, ${translate}px, 0) scale(1.18)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={`hotc-hero hotc-phero hotc-hero--${slice.primary.size ?? "lg"}`}
      style={style}
    >
      <div ref={bgRef} className="hotc-phero__bg">
        {isFilled.linkToMedia(slice.primary.bgVideo) ? (
          <video
            className="hotc-phero__video"
            src={slice.primary.bgVideo.url}
            poster={
              slice.primary.bgPoster?.url ??
              slice.primary.bgImage?.url ??
              undefined
            }
            autoPlay
            muted
            loop
            playsInline
          />
        ) : slice.primary.bgImage?.url ? (
          <div
            className="hotc-phero__img"
            style={{ backgroundImage: `url(${slice.primary.bgImage.url})` }}
          />
        ) : null}
      </div>

      <div
        className={`hotc-hero__overlay hotc-overlay--${slice.primary.overlay ?? "strong"}`}
      />

      {slice.primary.foreground?.url && (
        <div className="hotc-phero__fg">
          <PrismicNextImage field={slice.primary.foreground} fallbackAlt="" />
        </div>
      )}

      <div className="bounded hotc-hero__inner hotc-phero__inner">
        {slice.primary.kicker && (
          <span className="hotc-kicker hotc-hero__kicker">
            {slice.primary.kicker}
          </span>
        )}
        {slice.primary.title && (
          <h1 className="hotc-hero__title">{slice.primary.title}</h1>
        )}
        {slice.primary.subtitle && (
          <p className="hotc-hero__subtitle">{slice.primary.subtitle}</p>
        )}
        {(slice.primary.primaryCtaLabel || slice.primary.secondaryCtaLabel) && (
          <div className="hotc-hero__ctas">
            {slice.primary.primaryCtaLabel && (
              <PrismicNextLink
                field={slice.primary.primaryCtaLink}
                className="hotc-btn hotc-btn--ember"
              >
                {slice.primary.primaryCtaLabel}
              </PrismicNextLink>
            )}
            {slice.primary.secondaryCtaLabel && (
              <PrismicNextLink
                field={slice.primary.secondaryCtaLink}
                className="hotc-btn hotc-btn--ghost"
                style={{ color: "#fff" }}
              >
                {slice.primary.secondaryCtaLabel}
              </PrismicNextLink>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ParallaxHero;
