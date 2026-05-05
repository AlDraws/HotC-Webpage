"use client";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";

/**
 * Props for `ImageGallery`.
 */
export type ImageGalleryProps = SliceComponentProps<Content.ImageGallerySlice>;

/**
 * Component for "ImageGallery" Slices.
 */
const ImageGallery = ({ slice }: ImageGalleryProps) => {
  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      as="section"
    >
      <div className="hotc-gallery">
        {slice.items.map((item, index) => (
          <div
            key={index}
            className="hotc-gallery__tile"
            style={
              item.image.url
                ? { backgroundImage: `url(${item.image.url})` }
                : undefined
            }
          />
        ))}
      </div>
    </Bounded>
  );
};

export default ImageGallery;
