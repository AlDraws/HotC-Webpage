import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `Quote`.
 */
export type QuoteProps = SliceComponentProps<Content.QuoteSlice>;

/**
 * Component for "Quote" Slices.
 */
const Quote = ({ slice }: QuoteProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for quote (variation: {slice.variation}) Slices
    </section>
  );
};

export default Quote;
