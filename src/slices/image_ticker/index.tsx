import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `ImageTicker`.
 */
export type ImageTickerProps = SliceComponentProps<Content.ImageTickerSlice>;

/**
 * Component for "ImageTicker" Slices.
 */
const ImageTicker = ({ slice }: ImageTickerProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for image_ticker (variation: {slice.variation}) Slices
    </section>
  );
};

export default ImageTicker;
