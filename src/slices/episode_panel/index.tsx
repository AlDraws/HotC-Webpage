import { PrismicNextImage } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import { EpisodePanelSlice } from "@/../prismicio-types";

export type EpisodePanelProps = SliceComponentProps<EpisodePanelSlice>;

const EpisodePanel = ({ slice }: EpisodePanelProps) => {
  return (
    <div className="hotc-ep-panel">
      {slice.primary.image?.url ? (
        <PrismicNextImage
          field={slice.primary.image}
          quality={100}
          className="block w-full"
          sizes="(min-width: 1080px) 1080px, 100vw"
          fallbackAlt={slice.primary.label ?? ""}
        />
      ) : null}
    </div>
  );
};

export default EpisodePanel;
