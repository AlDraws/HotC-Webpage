import type { ReactNode } from "react";

export default function EpisodesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {children}
    </div>
  );
}

