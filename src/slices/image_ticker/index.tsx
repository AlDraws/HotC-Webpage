"use client";

import { PrismicNextImage } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import { useEffect, useRef } from "react";
import { ImageTickerSlice } from "@/../prismicio-types";

export type ImageTickerProps = SliceComponentProps<ImageTickerSlice>;

/**
 * ImageTicker — horizontal marquee of images.
 *
 * Fix #4 (images "jump" on hover):
 * The cause is almost always one of:
 *   - `transform: scale()` applied to the marquee item itself,
 *     which changes the layout flow of the rail;
 *   - the rail being paused via `animation-play-state: paused`
 *     on hover, but the underlying CSS `translateX()` keyframes
 *     snapping back to 0 because the animation got reset.
 *
 * We solve both:
 *   1. Items are wrapped in a fixed-size frame; hover scale only
 *      affects an inner element, so the rail's layout never changes.
 *   2. The rail uses requestAnimationFrame to translate, holding
 *      its own offset in a ref. On hover, we set a `paused` flag —
 *      the rAF loop stops advancing the offset, but never resets it.
 *      No CSS animation, no snapping.
 */
const ImageTicker = ({ slice }: ImageTickerProps) => {
  const railRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Speed in px/sec. `slice.primary.speed` is "loop seconds" in the
    // model; convert to px/s based on rail width.
    const loopSeconds = slice.primary.speed || 30;

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current) {
        const half = rail.scrollWidth / 2; // we duplicate items below
        const speed = half / loopSeconds; // px per second
        offsetRef.current = (offsetRef.current + speed * dt) % half;
        rail.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [slice.primary.speed]);

  const items = slice.items ?? [];
  // Duplicate so the loop is seamless.
  const doubled = [...items, ...items];

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      // Full-bleed: stretch beyond the parent's max-width.
      className="relative w-screen overflow-hidden bg-slate-900 py-8"
      style={{ marginLeft: "calc(50% - 50vw)" }}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div
        ref={railRef}
        className="flex gap-4 will-change-transform"
        // Disable any CSS transition on the rail itself — only rAF moves it.
        style={{ transition: "none" }}
      >
        {doubled.map((item: any, i: number) => (
          <div
            key={i}
            // Fixed frame: no scale here, no margin shifts on hover.
            className="relative h-48 w-48 shrink-0 overflow-hidden rounded-md md:h-64 md:w-64"
          >
            {/* Hover scale lives on the INNER element. The frame above
                stays the same size, so the rail never reflows. */}
            <div className="absolute inset-0 transition-transform duration-300 ease-out hover:scale-[1.04]">
              {item.image?.url ? (
                <PrismicNextImage
                  field={item.image}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 256px, 192px"
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageTicker;
