import { SliceComponentProps, PrismicRichText } from "@prismicio/react";
import { EpisodeTextBeatSlice } from "@/../prismicio-types";

export type EpisodeTextBeatProps = SliceComponentProps<EpisodeTextBeatSlice>;

const EpisodeTextBeat = ({ slice }: EpisodeTextBeatProps) => {
  const tone = slice.primary.tone || "neutral";

  return (
    <div className={`hotc-tb hotc-tone-${tone}`}>
      <PrismicRichText field={slice.primary.text} />
    </div>
  );
};

export default EpisodeTextBeat;
