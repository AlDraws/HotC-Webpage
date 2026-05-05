"use client";
import { asText } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { QuoteSlice } from "@/../prismicio-types";

/**
 * Props for `Quote`.
 */
export type QuoteProps = SliceComponentProps<QuoteSlice>;

/**
 * Component for "Quote" Slices.
 */
const Quote = ({ slice }: QuoteProps) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hotc-quote"
    >
      <p className="hotc-quote__text">
        &ldquo;{asText(slice.primary.text)}&rdquo;
      </p>
      {(slice.primary.author || slice.primary.author_role) && (
        <span className="hotc-quote__source">
          {slice.primary.author}
          {slice.primary.author && slice.primary.author_role && " — "}
          {slice.primary.author_role}
        </span>
      )}
    </section>
  );
};

export default Quote;
