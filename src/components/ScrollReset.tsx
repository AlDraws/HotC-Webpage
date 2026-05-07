"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function resetScrollPosition() {
  const root = document.documentElement;
  const body = document.body;
  const previousScrollBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.scrollTop = 0;
  body.scrollTop = 0;
  root.style.scrollBehavior = previousScrollBehavior;
}

export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.history.scrollRestoration = "manual";

    const afterPaint = window.requestAnimationFrame(() => {
      resetScrollPosition();

      window.requestAnimationFrame(() => {
        resetScrollPosition();
      });
    });

    window.addEventListener("load", resetScrollPosition, { once: true });

    return () => {
      window.cancelAnimationFrame(afterPaint);
      window.removeEventListener("load", resetScrollPosition);
    };
  }, [pathname]);

  return null;
}
