"use client";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

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
      className="hotc-quote"
    >
      <p className="hotc-quote__text">&ldquo;{slice.primary.text}&rdquo;</p>
      {slice.primary.source && (
        <span className="hotc-quote__source">{slice.primary.source}</span>
      )}
    </section>
  );
};

export default Quote;
