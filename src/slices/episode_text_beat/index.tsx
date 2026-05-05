import { SliceComponentProps, PrismicRichText } from "@prismicio/react";

export type EpisodeTextBeatProps = SliceComponentProps<any>;

const EpisodeTextBeat = ({ slice }: EpisodeTextBeatProps) => {
  const tone = slice.primary.tone || "neutral";
  
  // Custom styles for different tones
  const toneStyles: Record<string, string> = {
    neutral: "text-on-ink-mute",
    thought: "text-slate-400 italic",
    action: "text-ember font-bold uppercase tracking-wider",
    shout: "text-white font-black uppercase text-2xl tracking-tighter",
  };

  return (
    <div className={`mx-auto max-w-xl px-6 py-8 text-center ${toneStyles[tone] || toneStyles.neutral}`}>
      <PrismicRichText field={slice.primary.text} />
    </div>
  );
};

export default EpisodeTextBeat;
