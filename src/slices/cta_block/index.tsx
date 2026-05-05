import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `CtaBlock`.
 */
export type CtaBlockProps = SliceComponentProps<Content.CtaBlockSlice>;

/**
 * Component for "CtaBlock" Slices.
 */
const CtaBlock = ({ slice }: CtaBlockProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for cta_block (variation: {slice.variation}) Slices
    </section>
  );
};

export default CtaBlock;
