import { SliceComponentProps } from "@prismicio/react";

export type EpisodeDividerProps = SliceComponentProps<any>;

const EpisodeDivider = ({ slice }: EpisodeDividerProps) => {
  const size = slice.primary.size || "md";

  return (
    <div className={`hotc-ediv hotc-ediv--${size}`}>
      <span className="hotc-ediv__line" />
      <span className="hotc-ediv__glyph">◆</span>
      <span className="hotc-ediv__line" />
    </div>
  );
};

export default EpisodeDivider;
