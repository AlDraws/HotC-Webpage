"use client";
import { SliceComponentProps } from "@prismicio/react";
import { LoreSectionSlice } from "@/../prismicio-types";

/**
 * Props for `LoreSection`.
 */
export type LoreSectionProps = SliceComponentProps<LoreSectionSlice>;

/**
 * Component for "LoreSection" Slices.
 */
const LoreSection = ({ slice }: LoreSectionProps) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hotc-lore"
    >
      <div className="hotc-lore__inner">
        <div>
          {slice.primary.kicker && (
            <span
              className="hotc-kicker"
              style={{ display: "block", marginBottom: "0.5rem" }}
            >
              {slice.primary.kicker}
            </span>
          )}
          <h2 className="hotc-h2">{slice.primary.title}</h2>
        </div>
        {/* Note: 'body' and 'image' fields were removed as they are not present in the LoreSection model. */}
      </div>
    </section>
  );
};

export default LoreSection;
