import { SliceComponentProps } from "@prismicio/react";

export type EpisodeDividerProps = SliceComponentProps<any>;

const EpisodeDivider = ({ slice }: EpisodeDividerProps) => {
  const size = slice.primary.size || "md";
  const heightClass = size === "lg" ? "py-24" : size === "sm" ? "py-8" : "py-16";

  return (
    <div className={`flex items-center justify-center gap-4 ${heightClass}`}>
      <span className="h-px w-12 bg-slate-800" />
      <span className="text-slate-700">◆</span>
      <span className="h-px w-12 bg-slate-800" />
    </div>
  );
};

export default EpisodeDivider;
