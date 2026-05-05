"use client";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { NewsletterEmbedSlice } from "@/../prismicio-types";

/**
 * Props for `NewsletterEmbed`.
 */
export type NewsletterEmbedProps = SliceComponentProps<NewsletterEmbedSlice>;

/**
 * Component for "NewsletterEmbed" Slices.
 */
const NewsletterEmbed = ({ slice }: NewsletterEmbedProps): JSX.Element => {
  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      as="section"
    >
      <div className="hotc-newsletter">
        <h3>{slice.primary.title || "Sundays in your inbox."}</h3>
        <p>{slice.primary.body || "One email when a new chapter drops."}</p>
        <form
          className="hotc-newsletter__form"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder={slice.primary.placeholder || "your@email.com"}
            required
          />
          <button className="hotc-btn hotc-btn--ember" type="submit">
            {slice.primary.cta_label || "Subscribe"}
          </button>
        </form>
      </div>
    </Bounded>
  );
};

export default NewsletterEmbed;
