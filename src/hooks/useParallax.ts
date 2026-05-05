"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** Scroll-based: pixels moved per pixel from viewport center (0.1–0.25) */
  strength?: number;
  /** Scroll-based: clamp max absolute translateY in px */
  max?: number;
  /** Pointer-based: max offset in px for X and Y */
  pointerStrength?: number | { x?: number; y?: number };
  /** Mode for effect */
  mode?: "scroll" | "mouse" | "both";
  /** Scale applied to avoid edge gaps while translating */
  scale?: number;
  /** Disable when user prefers reduced motion */
  respectReducedMotion?: boolean;
  /** Disable pointer parallax below this width (px) */
  disablePointerBelow?: number;
};

/**
 * Simple parallax hook tied to the element's position relative to
 * the viewport center. Returns a `ref` for the container and a
 * `style` object you can spread on the moving element.
 */
export function useParallax(options: Options = {}) {
  const {
    strength = 0.12,
    max = 60,
    pointerStrength = 0,
    mode = "scroll",
    scale = 1.08,
    respectReducedMotion = true,
    disablePointerBelow = 768,
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [y, setY] = useState(0);
  const [px, setPx] = useState(0);
  const [py, setPy] = useState(0);

  // Normalize pointer strengths into stable primitives so the effect
  // dependency array doesn't change on every render when passing
  // object literals from the component.
  const pStrengthX = typeof pointerStrength === "number" ? pointerStrength : pointerStrength?.x ?? 0;
  const pStrengthY = typeof pointerStrength === "number" ? pointerStrength : pointerStrength?.y ?? 0;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce =
      respectReducedMotion &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let frame = 0;

    const updateScroll = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const viewportH = window.innerHeight || 0;
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportH / 2;
      const delta = viewportCenter - elementCenter; // positive when element is above center
      const raw = delta * strength;
      const clamped = Math.max(-max, Math.min(max, raw));
      setY(clamped);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(updateScroll);
    };

    const onResize = () => {
      updateScroll();
    };

    // Pointer handling
    let pFrame = 0;
    const onPointerMove = (e: PointerEvent) => {
      if (pFrame) return;
      pFrame = requestAnimationFrame(() => {
        pFrame = 0;
        const vw = window.innerWidth || 1;
        const vh = window.innerHeight || 1;
        const cx = vw / 2;
        const cy = vh / 2;
        const dx = (e.clientX - cx) / cx; // -1..1
        const dy = (e.clientY - cy) / cy; // -1..1
        const maxX = Math.max(0, pStrengthX);
        const maxY = Math.max(0, pStrengthY);
        setPx(Math.max(-maxX, Math.min(maxX, dx * maxX)));
        setPy(Math.max(-maxY, Math.min(maxY, dy * maxY)));
      });
    };

    // Initial compute
    updateScroll();
    if (mode === "scroll" || mode === "both") {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
    }
    const allowPointer = mode !== "scroll" && (disablePointerBelow <= 0 || window.innerWidth >= disablePointerBelow);
    if ((mode === "mouse" || mode === "both") && allowPointer && (pStrengthX || pStrengthY)) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (pFrame) cancelAnimationFrame(pFrame);
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onResize as any);
      window.removeEventListener("pointermove", onPointerMove as any);
    };
  }, [strength, max, respectReducedMotion, mode, pStrengthX, pStrengthY, disablePointerBelow]);

  const style: React.CSSProperties = {
    transform: `translate3d(${px.toFixed(1)}px, ${(y + py).toFixed(1)}px, 0)${scale ? ` scale(${scale})` : ""}`,
    transformOrigin: "center",
    willChange: "transform",
  };

  return { ref, style } as const;
}
