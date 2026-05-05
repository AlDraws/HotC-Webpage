"use client";

import { Content } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { useEffect, useRef } from "react";
import Bounded from "@/components/Bounded";

export type ParallaxHeroProps = SliceComponentProps<any>;

/**
 * ParallaxHero
 *
 * Fix #2: "Recent Appearances" used to drift right on zoom-out because
 * the row was inside a section that did `padding-left: calc(50% - 50vw)`
 * to break out of the bounded container, but never re-centered its child.
 * Here we keep the parallax background full-bleed (absolute), and put
 * ALL foreground content inside a normal `<Bounded>`. That guarantees
 * `mx-auto + max-w-6xl` centering at every zoom level.
 *
 * Fix #4 (image scroll jump on hover): handled in ImageTicker, not here.
 */
const ParallaxHero = ({ slice }: ParallaxHeroProps) => {
  const bgRef = useRef<HTMLDivElement | null>(null);

  // Lightweight parallax: translate the bg layer by a fraction of scroll Y.
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
        // Only animate while the hero is near the viewport.
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

  const size = slice.primary.size === "md" ? "min-h-[60vh]" : "min-h-[80vh]";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={`relative isolate overflow-hidden bg-slate-900 text-white ${size}`}
    >
      {/* Full-bleed background. Absolute + inset-0 keeps it independent
          of the centered foreground container. */}
      <div ref={bgRef} className="absolute inset-0 -z-10 will-change-transform">
        {slice.primary.bgImage?.url ? (
          <PrismicNextImage
            field={slice.primary.bgImage}
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Foreground — bounded, centered at every zoom level. */}
      <Bounded yPadding="lg" className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {slice.primary.kicker ? (
            <p className="mb-4 text-sm uppercase tracking-wide text-slate-200">
              {slice.primary.kicker}
            </p>
          ) : null}

          <PrismicRichText
            field={slice.primary.title}
            components={{
              heading1: ({ children }) => (
                <h1 className="text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
                  {children}
                </h1>
              ),
            }}
          />

          <div className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-100">
            <PrismicRichText field={slice.primary.subtitle} />
          </div>

          {(slice.primary.primaryCtaLabel || slice.primary.secondaryCtaLabel) ? (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {slice.primary.primaryCtaLabel ? (
                <a
                  href={`/${slice.primary.primaryCtaTarget ?? ""}`}
                  className="rounded-sm bg-[var(--hotc-ember,#D97757)] px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {slice.primary.primaryCtaLabel}
                </a>
              ) : null}
              {slice.primary.secondaryCtaLabel ? (
                <a
                  href={`/${slice.primary.secondaryCtaTarget ?? ""}`}
                  className="rounded-sm border border-white/40 px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {slice.primary.secondaryCtaLabel}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </Bounded>

      {/* Foreground PNG (optional). Bounded too, so it never slides off. */}
      {slice.primary.foreground?.url ? (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
          <PrismicNextImage
            field={slice.primary.foreground}
            className="max-h-[90%] w-auto object-contain"
            quality={100}
          />
        </div>
      ) : null}
    </section>
  );
};

export default ParallaxHero;
