import { SliceComponentProps } from "@prismicio/react";
import { EpisodePanelSlice } from "@/../prismicio-types";
import SequentialEpisodeImage from "@/slices/episode_panel/SequentialEpisodeImage";
import type { EpisodePanelSequenceContext } from "@/slices/episode_panel/sequence-context";

export type EpisodePanelProps = SliceComponentProps<
  EpisodePanelSlice,
  EpisodePanelSequenceContext
>;

const EpisodePanel = ({ slice, index, context }: EpisodePanelProps) => {
  const panelIndex = context.panelOrderBySliceIndex[index] ?? 0;
  const alt = slice.primary.image.alt || slice.primary.label || "";

  return (
    <div className="hotc-ep-panel">
      {slice.primary.image?.url ? (
        <SequentialEpisodeImage
          field={slice.primary.image}
          alt={alt}
          panelIndex={panelIndex}
          sequenceId={context.sequenceId}
        />
      ) : null}
    </div>
  );
};

export default EpisodePanel;
