import { SliceComponentProps } from "@prismicio/react";
import PrismicImage from "@/components/PrismicImage";
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
      <PrismicImage
        field={slice.primary.image}
        fallbackAlt="Full-width artwork from Heirs of the Collapse"
        loading="lazy"
        sizes="100vw"
        quality={70}
      />
    </figure>
  );
};

export default ImageFull;
