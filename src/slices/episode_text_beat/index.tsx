import { SliceComponentProps, PrismicRichText } from "@prismicio/react";
import { EpisodeTextBeatSlice } from "@/../prismicio-types";

export type EpisodeTextBeatProps = SliceComponentProps<EpisodeTextBeatSlice>;

const EpisodeTextBeat = ({ slice }: EpisodeTextBeatProps) => {
  const tone = slice.primary.tone || "neutral";
  
  // Custom styles for different tones
  const toneStyles: Record<string, string> = {
    neutral: "text-slate-300",
    thought: "text-slate-400 italic",
    action: "text-[var(--hotc-ember,#D97757)] font-bold uppercase tracking-wider",
    shout: "text-white font-black uppercase text-2xl tracking-tighter",
  };

  return (
    <div className={`mx-auto max-w-xl px-6 py-8 text-center ${toneStyles[tone] || toneStyles.neutral}`}>
      <PrismicRichText field={slice.primary.text} />
    </div>
  );
};

export default EpisodeTextBeat;
