"use client";
import { PrismicNextImage } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import { ImageFullSlice } from "@/../prismicio-types";

/**
 * Props for `ImageFull`.
 */
export type ImageFullProps = SliceComponentProps<ImageFullSlice>;

/**
 * Component for "ImageFull" Slices.
 * Replicates: <figure class="hotc-image-full"><img /></figure>
 * from ui_kits/website/Slices.jsx::ImageFull
 */
const ImageFull = ({ slice }: ImageFullProps) => {
  return (
    <figure
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hotc-image-full"
    >
      <PrismicNextImage
        field={slice.primary.image}
        fallbackAlt=""
      />
    </figure>
  );
};

export default ImageFull;
