"use client";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { CalloutSlice } from "@/../prismicio-types";

/**
 * Props for `Callout`.
 */
export type CalloutProps = SliceComponentProps<CalloutSlice>;

/**
 * Component for "Callout" Slices.
 */
const Callout = ({ slice }: CalloutProps) => {
  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      as="section"
      yPadding="sm"
    >
      <aside className={`hotc-callout hotc-callout--${slice.primary.variant || "default"}`}>
        <div className="hotc-callout__bar" aria-hidden></div>
        <div className="hotc-callout__body">
          {slice.primary.title && <h4>{slice.primary.title}</h4>}
          <p>{slice.primary.body}</p>
        </div>
      </aside>
    </Bounded>
  );
};

export default Callout;
