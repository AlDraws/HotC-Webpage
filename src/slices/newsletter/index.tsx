import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `NewsletterEmbed`.
 */
export type NewsletterEmbedProps = SliceComponentProps<Content.NewsletterEmbedSlice>;

/**
 * Component for "NewsletterEmbed" Slices.
 */
const NewsletterEmbed = ({ slice }: NewsletterEmbedProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for newsletter (variation: {slice.variation}) Slices
    </section>
  );
};

export default NewsletterEmbed;
