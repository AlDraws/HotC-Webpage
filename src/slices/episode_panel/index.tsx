import { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";

export type EpisodePanelProps = SliceComponentProps<any>;

const EpisodePanel = ({ slice }: EpisodePanelProps) => {
  return (
    <div className="hotc-ep-panel">
      {slice.primary.image?.url ? (
        <PrismicNextImage
          field={slice.primary.image}
          quality={100}
          className="block w-full"
          sizes="(min-width: 1080px) 1080px, 100vw"
          alt={slice.primary.alt ?? ""}
        />
      ) : null}
    </div>
  );
};

export default EpisodePanel;
