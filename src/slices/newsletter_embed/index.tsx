"use client";

import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import { getUiCopy } from "@/lib/ui-copy";
import { NewsletterEmbedSlice } from "@/../prismicio-types";

/**
 * Props for `NewsletterEmbed`.
 */
export type NewsletterEmbedProps = SliceComponentProps<NewsletterEmbedSlice, HotcSliceContext>;

/**
 * Component for "NewsletterEmbed" Slices.
 */
const NewsletterEmbed = ({ slice, context }: NewsletterEmbedProps) => {
  const locale = getSliceLocale(context);
  const copy = getUiCopy(locale);
  return (
    <Bounded data-slice-type={slice.slice_type} data-slice-variation={slice.variation} as="section">
      <div className="hotc-newsletter">
        <h2>{slice.primary.title || copy.newsletter.title}</h2>
        <div className="hotc-newsletter__body">
          <PrismicRichText
            field={slice.primary.description}
            fallback={<p>{copy.newsletter.description}</p>}
          />
        </div>
        <form className="hotc-newsletter__form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder={slice.primary.placeholder || copy.newsletter.placeholder}
            required
          />
          <button className="hotc-btn hotc-btn--ember" type="submit">
            {slice.primary.cta_label || copy.newsletter.subscribe}
          </button>
        </form>
      </div>
    </Bounded>
  );
};

export default NewsletterEmbed;
