"use client";

import Image from "next/image";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AppLocale } from "@/lib/locale";
import { getUiCopy } from "@/lib/ui-copy";

type LightboxImage = {
  src: string;
  alt?: string;
  width?: number | null;
  height?: number | null;
};

type LightboxContextValue = {
  openLightbox: (images: LightboxImage[], startIndex?: number) => void;
  closeLightbox: () => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}

export function LightboxProvider({ children, locale }: { children: ReactNode; locale: AppLocale }) {
  const copy = getUiCopy(locale);
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isOpen = images.length > 0;

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const closeLightbox = useCallback(() => {
    setImages([]);
    setCurrentIndex(0);
  }, []);

  const openLightbox = useCallback((nextImages: LightboxImage[], startIndex = 0) => {
    const validImages = nextImages.filter((image) => Boolean(image.src));
    if (!validImages.length) return;
    setImages(validImages);
    setCurrentIndex(clampIndex(startIndex, validImages.length));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (images.length <= 1) return prev;
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (images.length <= 1) return prev;
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const panel = panelRef.current;
    const getFocusable = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          closeLightbox();
          return;
        case "ArrowRight":
          goNext();
          return;
        case "ArrowLeft":
          goPrev();
          return;
        case "Tab": {
          const focusable = getFocusable();
          if (!focusable.length) {
            event.preventDefault();
            return;
          }
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey) {
            if (document.activeElement === first) {
              event.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
          return;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
    };
  }, [closeLightbox, goNext, goPrev, isOpen]);

  const contextValue = useMemo(
    () => ({ openLightbox, closeLightbox }),
    [openLightbox, closeLightbox]
  );

  const activeImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  return (
    <LightboxContext.Provider value={contextValue}>
      {children}

      {isOpen && activeImage ? (
        <div
          className="hotc-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={copy.common.imageViewer}
          onClick={closeLightbox}
        >
          <div ref={panelRef} className="hotc-lightbox__panel" onClick={(e) => e.stopPropagation()}>
            <button
              ref={closeButtonRef}
              type="button"
              className="hotc-lightbox__close"
              aria-label={copy.common.closeImageViewer}
              onClick={closeLightbox}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {hasMultiple ? (
              <button
                type="button"
                className="hotc-lightbox__nav hotc-lightbox__nav--prev"
                aria-label={copy.common.previousImage}
                onClick={goPrev}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            ) : null}

            <Image
              src={activeImage.src}
              alt={activeImage.alt || ""}
              width={activeImage.width || 1600}
              height={activeImage.height || 1000}
              className="hotc-lightbox__image"
              loading="eager"
              decoding="async"
              sizes="100vw"
            />

            {hasMultiple ? (
              <button
                type="button"
                className="hotc-lightbox__nav hotc-lightbox__nav--next"
                aria-label={copy.common.nextImage}
                onClick={goNext}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error("useLightbox must be used within LightboxProvider");
  }
  return context;
}
