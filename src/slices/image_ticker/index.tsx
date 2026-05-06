"use client";

import { PrismicNextImage } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import { useEffect, useRef } from "react";
import { ImageTickerSlice } from "@/../prismicio-types";

export type ImageTickerProps = SliceComponentProps<ImageTickerSlice>;

function getLinkHref(linkField: unknown): string | null {
  if (
    linkField &&
    typeof linkField === "object" &&
    "url" in linkField &&
    typeof (linkField as { url?: unknown }).url === "string" &&
    (linkField as { url: string }).url
  ) {
    return (linkField as { url: string }).url;
  }
  return null;
}

function wrapOffset(value: number, span: number): number {
  if (!Number.isFinite(span) || span <= 0) return 0;
  return ((value % span) + span) % span;
}

const ImageTicker = ({ slice }: ImageTickerProps) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const halfRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerXRef = useRef(0);
  const centeredRef = useRef(false);
  const reduceMotionRef = useRef(false);

  const speed = slice.primary.speed || 30;
  const isReverse = Boolean(slice.primary.reverse);
  const primary = slice.primary as {
    background_color?: string | null;
    background_image?: { url?: string | null } | null;
  };
  const backgroundStyle: Record<string, string> = {};
  if (primary.background_color) {
    backgroundStyle.backgroundColor = primary.background_color;
  }
  if (primary.background_image?.url) {
    backgroundStyle.backgroundImage = `url(${primary.background_image.url})`;
    backgroundStyle.backgroundSize = "cover";
    backgroundStyle.backgroundPosition = "center";
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    const rail = railRef.current;
    if (!rail || !viewport) return;
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const measure = (recenter = false) => {
      const half = rail.scrollWidth / 2;
      halfRef.current = half;
      if (recenter || !centeredRef.current) {
        const centered = Math.max((half - viewport.clientWidth) / 2, 0);
        offsetRef.current = wrapOffset(centered, half);
        rail.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
        centeredRef.current = true;
      }
    };

    measure(true);

    const images = Array.from(rail.querySelectorAll("img"));
    let pending = 0;
    const onAssetReady = () => {
      pending -= 1;
      if (pending <= 0) measure(true);
    };
    for (const img of images) {
      if (!img.complete) {
        pending += 1;
        img.addEventListener("load", onAssetReady, { once: true });
        img.addEventListener("error", onAssetReady, { once: true });
      }
    }
    if (pending === 0) measure(true);

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current && !draggingRef.current && !reduceMotionRef.current) {
        const half = halfRef.current;
        const pxPerSecond = half > 0 ? half / Math.max(speed, 1) : 0;
        const delta = pxPerSecond * dt * (isReverse ? -1 : 1);
        offsetRef.current = wrapOffset(offsetRef.current + delta, half);
        rail.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    const resizeObserver = new ResizeObserver(() => measure(false));
    resizeObserver.observe(rail);
    resizeObserver.observe(viewport);

    const handleWheel = (event: WheelEvent) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      offsetRef.current = wrapOffset(offsetRef.current + delta, halfRef.current);
      rail.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };
    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      viewport.removeEventListener("wheel", handleWheel);
      for (const img of images) {
        img.removeEventListener("load", onAssetReady);
        img.removeEventListener("error", onAssetReady);
      }
    };
  }, [isReverse, speed]);

  const items = slice.items ?? [];
  const doubled = [...items, ...items];

  return (
    <div
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hotc-ticker"
      style={backgroundStyle}
    >
      <div
        ref={viewportRef}
        className="hotc-ticker__viewport"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
          draggingRef.current = false;
        }}
        onPointerDown={(event) => {
          draggingRef.current = true;
          pointerXRef.current = event.clientX;
          (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!draggingRef.current) return;
          const dx = event.clientX - pointerXRef.current;
          pointerXRef.current = event.clientX;
          offsetRef.current = wrapOffset(offsetRef.current - dx, halfRef.current);
          if (railRef.current) {
            railRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
          }
        }}
        onPointerUp={(event) => {
          draggingRef.current = false;
          (event.currentTarget as HTMLDivElement).releasePointerCapture(
            event.pointerId
          );
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
      >
        <div ref={railRef} className="hotc-ticker__rail" style={{ transition: "none" }}>
          {doubled.map((item, i) => {
            const typedItem = item as typeof item & {
              link?: unknown;
              image_link?: unknown;
            };
            const href =
              getLinkHref(typedItem.link) ?? getLinkHref(typedItem.image_link);
            return (
              <div
                key={i}
                className="hotc-ticker__cell"
                style={{ position: "relative" }}
              >
                {item.image?.url ? (
                  href ? (
                    <a
                      href={href}
                      className="hotc-ticker__link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PrismicNextImage
                        field={item.image}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 260px, 200px"
                        fallbackAlt=""
                      />
                    </a>
                  ) : (
                    <PrismicNextImage
                      field={item.image}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 260px, 200px"
                      fallbackAlt=""
                    />
                  )
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ImageTicker;
