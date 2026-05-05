import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `ImageCards`.
 */
export type ImageCardsProps = SliceComponentProps<Content.ImageCardsSlice>;

/**
 * Component for "ImageCards" Slices.
 */
const ImageCards = ({ slice }: ImageCardsProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for image_cards (variation: {slice.variation}) Slices
    </section>
  );
};

export default ImageCards;
