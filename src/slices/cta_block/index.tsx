"use client";
import { PrismicNextLink } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { CtaBlockSlice } from "@/../prismicio-types";

/**
 * Props for `CtaBlock`.
 */
export type CtaBlockProps = SliceComponentProps<CtaBlockSlice>;

/**
 * Component for "CtaBlock" Slices.
 */
const CtaBlock = ({ slice }: CtaBlockProps) => {
  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      as="section"
    >
      <div className="hotc-cta-block">
        <h2>{slice.primary.title}</h2>
        {slice.primary.description && <p>{slice.primary.description}</p>}
        {slice.primary.cta_label && (
          <PrismicNextLink
            field={slice.primary.cta_link}
            className="hotc-btn hotc-btn--ink"
          >
            {slice.primary.cta_label}
          </PrismicNextLink>
        )}
      </div>
    </Bounded>
  );
};

export default CtaBlock;
