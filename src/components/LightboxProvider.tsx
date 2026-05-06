"use client";

import Image from "next/image";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isOpen = images.length > 0;

  const closeLightbox = useCallback(() => {
    setImages([]);
    setCurrentIndex(0);
  }, []);

  const openLightbox = useCallback(
    (nextImages: LightboxImage[], startIndex = 0) => {
      const validImages = nextImages.filter((image) => Boolean(image.src));
      if (!validImages.length) return;
      setImages(validImages);
      setCurrentIndex(clampIndex(startIndex, validImages.length));
    },
    []
  );

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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
        return;
      }
      if (event.key === "ArrowRight") {
        goNext();
        return;
      }
      if (event.key === "ArrowLeft") {
        goPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
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
          aria-label="Image viewer"
          onClick={closeLightbox}
        >
          <div className="hotc-lightbox__panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="hotc-lightbox__close"
              aria-label="Close image viewer"
              onClick={closeLightbox}
            >
              X
            </button>

            {hasMultiple ? (
              <button
                type="button"
                className="hotc-lightbox__nav hotc-lightbox__nav--prev"
                aria-label="Previous image"
                onClick={goPrev}
              >
                {"<"}
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
                aria-label="Next image"
                onClick={goNext}
              >
                {">"}
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
