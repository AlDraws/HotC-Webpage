"use client";

import type { ImageField } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { useEffect, useRef, useState } from "react";
import PrismicImage from "@/components/PrismicImage";
import { resolveLinkProps } from "@/lib/links";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import { formatUiText, getUiCopy } from "@/lib/ui-copy";
import { ImageTickerSlice } from "@/../prismicio-types";

export type ImageTickerProps = SliceComponentProps<ImageTickerSlice, HotcSliceContext>;

const MIN_TICKER_COPIES = 3;

function wrapOffset(value: number, span: number): number {
  if (!Number.isFinite(span) || span <= 0) return 0;
  return ((value % span) + span) % span;
}

const ImageTicker = ({ slice, context }: ImageTickerProps) => {
  const locale = getSliceLocale(context);
  const copy = getUiCopy(locale);
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
    background_image?: ImageField | null;
  };
  const backgroundStyle: Record<string, string> = {};
  if (primary.background_color) {
    backgroundStyle.backgroundColor = primary.background_color;
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    const rail = railRef.current;
    if (!rail || !viewport || items.length === 0) return;
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderPosition = () => {
      rail.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    const measure = () => {
      const firstCell = rail.children[0] as HTMLElement | undefined;
      const firstRepeatedCell = rail.children[items.length] as HTMLElement | undefined;
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
      if (!pausedRef.current && !draggingRef.current && !reduceMotionRef.current) {
        const cycleWidth = cycleWidthRef.current;
        const pxPerSecond = cycleWidth > 0 ? cycleWidth / Math.max(speed, 1) : 0;
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
      {primary.background_image?.url ? (
        <PrismicImage
          field={primary.background_image}
          decorative
          fill
          sizes="100vw"
          quality={50}
          className="hotc-ticker__bg"
        />
      ) : null}
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
          offsetRef.current = wrapOffset(offsetRef.current - dx, cycleWidthRef.current);
          if (railRef.current) {
            railRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
          }
        }}
        onPointerUp={(event) => {
          draggingRef.current = false;
          suppressClickRef.current = didDragRef.current;
          pausedRef.current =
            event.pointerType === "mouse" ? hoveringRef.current : wasPausedBeforeDragRef.current;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={(event) => {
          draggingRef.current = false;
          pausedRef.current =
            event.pointerType === "mouse" ? hoveringRef.current : wasPausedBeforeDragRef.current;
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
              const link =
                resolveLinkProps(typedItem.link, { locale }) ??
                resolveLinkProps(typedItem.image_link, { locale });
              const showBadge = Boolean(typedItem.show_badge) && Boolean(typedItem.badge_text);
              return (
                <div
                  key={`${copyIndex}-${itemIndex}`}
                  className="hotc-ticker__cell"
                  style={{ position: "relative" }}
                >
                  {item.image?.url ? (
                    link ? (
                      <a
                        href={link.href}
                        className="hotc-ticker__link"
                        target={link.isExternal ? (link.target ?? "_blank") : link.target}
                        rel={link.isExternal ? (link.rel ?? "noopener noreferrer") : link.rel}
                        draggable={false}
                      >
                        <PrismicImage
                          field={item.image}
                          fallbackAlt={
                            item.image.alt ||
                            typedItem.badge_text ||
                            formatUiText(copy.images.tickerImage, {
                              index: itemIndex + 1,
                            })
                          }
                          fill
                          className="object-cover"
                          sizes="(min-width: 768px) 260px, 200px"
                          quality={50}
                          draggable={false}
                        />
                        {showBadge ? (
                          <span className="hotc-ticker__badge">{typedItem.badge_text}</span>
                        ) : null}
                      </a>
                    ) : (
                      <>
                        <PrismicImage
                          field={item.image}
                          fallbackAlt={
                            item.image.alt ||
                            typedItem.badge_text ||
                            formatUiText(copy.images.tickerImage, {
                              index: itemIndex + 1,
                            })
                          }
                          fill
                          className="object-cover"
                          sizes="(min-width: 768px) 260px, 200px"
                          quality={50}
                          draggable={false}
                        />
                        {showBadge ? (
                          <span className="hotc-ticker__badge">{typedItem.badge_text}</span>
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
