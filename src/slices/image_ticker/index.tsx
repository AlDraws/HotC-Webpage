"use client";

import { PrismicNextImage } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import { useEffect, useRef, useState } from "react";
import { ImageTickerSlice } from "@/../prismicio-types";

export type ImageTickerProps = SliceComponentProps<ImageTickerSlice>;

const MIN_TICKER_COPIES = 3;

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

function normalizeHref(rawHref: string): string {
  const value = rawHref.trim();
  if (!value) return value;

  if (/^(mailto:|tel:|sms:)/i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;

  return `https://${value.replace(/^\/+/, "")}`;
}

function isExternalHref(href: string): boolean {
  if (!href || href.startsWith("/")) return false;
  if (/^(mailto:|tel:|sms:)/i.test(href)) return true;
  if (typeof window === "undefined") return /^https?:\/\//i.test(href);

  try {
    const resolved = new URL(href, window.location.origin);
    return resolved.origin !== window.location.origin;
  } catch {
    return false;
  }
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
  const cycleWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerXRef = useRef(0);
  const dragStartXRef = useRef(0);
  const didDragRef = useRef(false);
  const hoveringRef = useRef(false);
  const suppressClickRef = useRef(false);
  const wasPausedBeforeDragRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const [copyCount, setCopyCount] = useState(MIN_TICKER_COPIES);

  const speed = slice.primary.speed || 30;
  const isReverse = Boolean(slice.primary.reverse);
  const items = slice.items ?? [];
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
    if (!rail || !viewport || items.length === 0) return;
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const renderPosition = () => {
      rail.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    const measure = () => {
      const firstCell = rail.children[0] as HTMLElement | undefined;
      const firstRepeatedCell = rail.children[items.length] as
        | HTMLElement
        | undefined;
      if (!firstCell || !firstRepeatedCell) return;

      const cycleWidth = firstRepeatedCell.offsetLeft - firstCell.offsetLeft;
      if (!Number.isFinite(cycleWidth) || cycleWidth <= 0) return;

      cycleWidthRef.current = cycleWidth;
      offsetRef.current = wrapOffset(offsetRef.current, cycleWidth);
      renderPosition();

      const requiredCopies = Math.max(
        MIN_TICKER_COPIES,
        Math.ceil(viewport.clientWidth / cycleWidth) + 2
      );
      if (requiredCopies !== copyCount) {
        setCopyCount(requiredCopies);
      }
    };

    measure();

    const images = Array.from(rail.querySelectorAll("img"));
    let pending = 0;
    const onAssetReady = () => {
      pending -= 1;
      if (pending <= 0) measure();
    };
    for (const img of images) {
      if (!img.complete) {
        pending += 1;
        img.addEventListener("load", onAssetReady, { once: true });
        img.addEventListener("error", onAssetReady, { once: true });
      }
    }
    if (pending === 0) measure();

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (
        !pausedRef.current &&
        !draggingRef.current &&
        !reduceMotionRef.current
      ) {
        const cycleWidth = cycleWidthRef.current;
        const pxPerSecond =
          cycleWidth > 0 ? cycleWidth / Math.max(speed, 1) : 0;
        const delta = pxPerSecond * dt * (isReverse ? -1 : 1);
        offsetRef.current = wrapOffset(offsetRef.current + delta, cycleWidth);
        renderPosition();
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(rail);
    resizeObserver.observe(viewport);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      for (const img of images) {
        img.removeEventListener("load", onAssetReady);
        img.removeEventListener("error", onAssetReady);
      }
    };
  }, [copyCount, isReverse, items.length, speed]);

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
          hoveringRef.current = true;
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          hoveringRef.current = false;
          if (!draggingRef.current) {
            pausedRef.current = false;
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          draggingRef.current = true;
          pointerXRef.current = event.clientX;
          dragStartXRef.current = event.clientX;
          didDragRef.current = false;
          suppressClickRef.current = false;
          wasPausedBeforeDragRef.current = pausedRef.current;
          pausedRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!draggingRef.current) return;
          const dx = event.clientX - pointerXRef.current;
          if (dx === 0) return;
          event.preventDefault();
          pointerXRef.current = event.clientX;
          if (Math.abs(event.clientX - dragStartXRef.current) > 4) {
            didDragRef.current = true;
          }
          offsetRef.current = wrapOffset(
            offsetRef.current - dx,
            cycleWidthRef.current
          );
          if (railRef.current) {
            railRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
          }
        }}
        onPointerUp={(event) => {
          draggingRef.current = false;
          suppressClickRef.current = didDragRef.current;
          pausedRef.current =
            event.pointerType === "mouse"
              ? hoveringRef.current
              : wasPausedBeforeDragRef.current;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={(event) => {
          draggingRef.current = false;
          pausedRef.current =
            event.pointerType === "mouse"
              ? hoveringRef.current
              : wasPausedBeforeDragRef.current;
        }}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }}
      >
        <div ref={railRef} className="hotc-ticker__rail" style={{ transition: "none" }}>
          {Array.from({ length: copyCount }, (_, copyIndex) =>
            items.map((item, itemIndex) => {
              const typedItem = item as typeof item & {
                link?: unknown;
                image_link?: unknown;
                show_badge?: boolean | null;
                badge_text?: string | null;
              };
              const rawHref =
                getLinkHref(typedItem.link) ?? getLinkHref(typedItem.image_link);
              const href = rawHref ? normalizeHref(rawHref) : null;
              const isExternal = href ? isExternalHref(href) : false;
              const showBadge =
                Boolean(typedItem.show_badge) && Boolean(typedItem.badge_text);
              return (
                <div
                  key={`${copyIndex}-${itemIndex}`}
                  className="hotc-ticker__cell"
                  style={{ position: "relative" }}
                >
                  {item.image?.url ? (
                    href ? (
                      <a
                        href={href}
                        className="hotc-ticker__link"
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        draggable={false}
                      >
                        <PrismicNextImage
                          field={item.image}
                          fill
                          className="object-cover"
                          sizes="(min-width: 768px) 260px, 200px"
                          fallbackAlt=""
                          draggable={false}
                        />
                        {showBadge ? (
                          <span className="hotc-ticker__badge">
                            {typedItem.badge_text}
                          </span>
                        ) : null}
                      </a>
                    ) : (
                      <>
                        <PrismicNextImage
                          field={item.image}
                          fill
                          className="object-cover"
                          sizes="(min-width: 768px) 260px, 200px"
                          fallbackAlt=""
                          draggable={false}
                        />
                        {showBadge ? (
                          <span className="hotc-ticker__badge">
                            {typedItem.badge_text}
                          </span>
                        ) : null}
                      </>
                    )
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageTicker;
