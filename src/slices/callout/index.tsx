import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `Callout`.
 */
export type CalloutProps = SliceComponentProps<Content.CalloutSlice>;

/**
 * Component for "Callout" Slices.
 */
const Callout = ({ slice }: CalloutProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for callout (variation: {slice.variation}) Slices
    </section>
  );
};

export default Callout;
