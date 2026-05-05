"use client";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { FeatureGridSlice } from "@/../prismicio-types";

/**
 * Props for `FeatureGrid`.
 */
export type FeatureGridProps = SliceComponentProps<FeatureGridSlice>;

/**
 * Component for "FeatureGrid" Slices.
 */
const FeatureGrid = ({ slice }: FeatureGridProps) => {
  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      as="section"
    >
      {(slice.primary.kicker || slice.primary.title) && (
        <div className="hotc-cgrid__head">
          {slice.primary.kicker && (
            <span className="hotc-kicker">{slice.primary.kicker}</span>
          )}
          {slice.primary.title && <h2>{slice.primary.title}</h2>}
        </div>
      )}
      <div className="hotc-fgrid">
        {slice.items.map((item, index) => (
          <article key={index} className="hotc-fcard">
            <div className="hotc-fcard__icon">{item.glyph || "★"}</div>
            <h4>{item.title}</h4>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </Bounded>
  );
};

export default FeatureGrid;
