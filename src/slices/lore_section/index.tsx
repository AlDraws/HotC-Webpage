"use client";
import { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `LoreSection`.
 */
export type LoreSectionProps = SliceComponentProps<Content.LoreSectionSlice>;

/**
 * Component for "LoreSection" Slices.
 */
const LoreSection = ({ slice }: LoreSectionProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hotc-lore"
    >
      <div className="hotc-lore__inner">
        <div>
          <h2>{slice.primary.title}</h2>
          <p style={{ marginTop: "1rem" }}>{slice.primary.body}</p>
        </div>
        {slice.primary.image.url && (
          <PrismicNextImage
            field={slice.primary.image}
            className="hotc-lore__img"
            fallbackAlt=""
          />
        )}
      </div>
    </section>
  );
};

export default LoreSection;
