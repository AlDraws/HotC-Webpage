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
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<HTMLDivElement | null>(null);
  const primary = slice.primary as {
    height_vh?: number | null;
    bgStrength?: number | null;
    fgStrength?: number | null;
  };
  const customHeightVh =
    typeof primary.height_vh === "number" &&
    Number.isFinite(primary.height_vh) &&
    primary.height_vh > 0
      ? Math.min(primary.height_vh, 100)
      : null;
  const bgStrength =
    typeof primary.bgStrength === "number" && Number.isFinite(primary.bgStrength)
      ? primary.bgStrength
      : 0.18;
  const fgStrength =
    typeof primary.fgStrength === "number" && Number.isFinite(primary.fgStrength)
      ? primary.fgStrength
      : 0.42;
  const style: CSSProperties | undefined = customHeightVh
    ? ({ "--hotc-phero-height": `${customHeightVh}vh` } as CSSProperties)
    : undefined;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    if (reduce || small) return;

    const hero = sectionRef.current;
    if (!hero) return;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);
    const bgTravel = clamp(bgStrength * 120, 12, 72);
    const fgTravel = clamp(fgStrength * 120, 20, 96);

    let raf = 0;
    const updateParallax = () => {
      raf = 0;

      const bg = bgRef.current;
      const fg = fgRef.current;
      const rect = hero.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const heroCenter = rect.top + rect.height / 2;
      const maxDistance = (window.innerHeight + rect.height) / 2 || 1;
      const progress = clamp((viewportCenter - heroCenter) / maxDistance, -1, 1);

      if (bg) {
        bg.style.transform = `translate3d(0, ${(progress * bgTravel).toFixed(2)}px, 0) scale(1.12)`;
      }

      if (fg) {
        fg.style.transform = `translate3d(0, ${(progress * fgTravel).toFixed(2)}px, 0)`;
      }
    };

    const requestUpdate = () => {
      if (raf) return;
      raf = requestAnimationFrame(updateParallax);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [bgStrength, fgStrength]);

  return (
    <section
      ref={sectionRef}
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
          <div className="hotc-phero__img">
            <PrismicNextImage
              field={slice.primary.bgImage}
              fallbackAlt=""
              fill
              sizes="100vw"
              preload={true}
              className="hotc-phero__bg-img"
            />
          </div>
        ) : null}
      </div>

      <div
        className={`hotc-hero__overlay hotc-overlay--${slice.primary.overlay ?? "strong"}`}
      />

      {slice.primary.foreground?.url && (
        <div ref={fgRef} className="hotc-phero__fg">
          <PrismicNextImage
            field={slice.primary.foreground}
            fallbackAlt=""
          />
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
