import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

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
    >
      Placeholder component for lore_section (variation: {slice.variation}) Slices
    </section>
  );
};

export default LoreSection;
