import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `ImageFull`.
 */
export type ImageFullProps = SliceComponentProps<Content.ImageFullSlice>;

/**
 * Component for "ImageFull" Slices.
 */
const ImageFull = ({ slice }: ImageFullProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for image_full (variation: {slice.variation}) Slices
    </section>
  );
};

export default ImageFull;
