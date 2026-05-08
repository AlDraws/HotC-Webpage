"use client";

import type { ImageField } from "@prismicio/client";
import PrismicImage from "@/components/PrismicImage";
import { useLightbox } from "@/components/LightboxProvider";

type Props = {
  field: ImageField;
  alt: string;
  ariaLabel: string;
  className: string;
  sizes: string;
  quality: number;
};

export default function LightboxImageButton({
  field,
  alt,
  ariaLabel,
  className,
  sizes,
  quality,
}: Props) {
  const { openLightbox } = useLightbox();

  if (!field.url) {
    return (
      <PrismicImage
        field={field}
        fallbackAlt={alt}
        className={className}
        sizes={sizes}
        quality={quality}
      />
    );
  }

  return (
    <button
      type="button"
      className="hotc-twi__img-trigger hotc-pressable"
      onClick={() =>
        openLightbox([
          {
            src: field.url || "",
            alt,
            width: field.dimensions?.width,
            height: field.dimensions?.height,
          },
        ])
      }
      aria-label={ariaLabel}
    >
      <PrismicImage
        field={field}
        className={className}
        fallbackAlt={alt}
        sizes={sizes}
        quality={quality}
      />
    </button>
  );
}
