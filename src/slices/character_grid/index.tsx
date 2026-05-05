import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `CharacterGrid`.
 */
export type CharacterGridProps = SliceComponentProps<Content.CharacterGridSlice>;

/**
 * Component for "CharacterGrid" Slices.
 */
const CharacterGrid = ({ slice }: CharacterGridProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for character_grid (variation: {slice.variation}) Slices
    </section>
  );
};

export default CharacterGrid;
