"use client";

import type { ImageField } from "@prismicio/client";
import PrismicImage from "@/components/PrismicImage";
import { useLightbox } from "@/components/LightboxProvider";

type LightboxImage = {
  src: string;
  alt?: string;
  width?: number | null;
  height?: number | null;
};

type Props = {
  field: ImageField;
  alt: string;
  ariaLabel: string;
  images: LightboxImage[];
  index: number;
};

export default function GalleryTile({ field, alt, ariaLabel, images, index }: Props) {
  const { openLightbox } = useLightbox();

  return (
    <button
      type="button"
      className="hotc-gallery__tile hotc-pressable"
      aria-label={ariaLabel}
      onClick={() => openLightbox(images, index)}
    >
      <PrismicImage
        field={field}
        fallbackAlt={alt}
        fill
        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
        quality={75}
        className="hotc-gallery__image"
      />
    </button>
  );
}
