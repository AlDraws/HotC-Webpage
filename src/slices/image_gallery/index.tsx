"use client";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { useLightbox } from "@/components/LightboxProvider";

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
    .map((item) => ({
      src: item.image.url || "",
      alt: item.image.alt || "",
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
            style={
              image.src
                ? { backgroundImage: `url(${image.src})` }
                : undefined
            }
          />
        ))}
      </div>
    </Bounded>
  );
};

export default ImageGallery;
