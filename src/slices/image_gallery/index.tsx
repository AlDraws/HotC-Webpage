"use client";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { useLightbox } from "@/components/LightboxProvider";
import PrismicImage from "@/components/PrismicImage";

/**
 * Props for `ImageGallery`.
 */
export type ImageGalleryProps = SliceComponentProps<Content.ImageGallerySlice>;

/**
 * Component for "ImageGallery" Slices.
 */
const ImageGallery = ({ slice }: ImageGalleryProps) => {
  const { openLightbox } = useLightbox();
  const images = slice.items
    .map((item, index) => ({
      field: item.image,
      src: item.image.url || "",
      alt: item.image.alt || `Gallery image ${index + 1}`,
      width: item.image.dimensions?.width,
      height: item.image.dimensions?.height,
    }))
    .filter((image) => Boolean(image.src));

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      as="section"
    >
      <div className="hotc-gallery">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            className="hotc-gallery__tile hotc-pressable"
            aria-label={`Open image ${index + 1}`}
            onClick={() => openLightbox(images, index)}
          >
            <PrismicImage
              field={image.field}
              fallbackAlt={image.alt}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              quality={75}
              className="hotc-gallery__image"
            />
          </button>
        ))}
      </div>
    </Bounded>
  );
};

export default ImageGallery;
