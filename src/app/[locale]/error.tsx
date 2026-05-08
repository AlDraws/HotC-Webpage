"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-bangers text-4xl tracking-wide text-[var(--hotc-ember)]">
        Something went wrong
      </h1>
      <p className="max-w-md text-[var(--hotc-ink-2)]">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button type="button" onClick={reset} className="hotc-btn hotc-btn--ember">
        Try again
      </button>
    </div>
  );
}
