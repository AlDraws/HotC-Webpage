"use client";

import { useEffect, useRef, useState } from "react";

type BrandLogoProps = {
  /** Public path or remote URL to an SVG. */
  src: string;
  /** Accessible label. */
  alt?: string;
  /**
   * Target visual stroke width in CSS pixels. The component
   * measures its rendered size and rewrites every <path>/<line>/...
   * stroke-width so it always *appears* at this thickness,
   * regardless of zoom or container size.
   */
  visualStroke?: number;
  className?: string;
};

/**
 * Logo loader that adapts SVG stroke thickness to the rendered size.
 *
 * Fix #1: when an SVG with strokes is scaled down (zoom out, small
 * header logo), strokes can either look too heavy (raster/PNG) or
 * collapse and disappear (SVG with `vector-effect: non-scaling-stroke`
 * misused, or with absolute pixel widths defined for a large viewBox).
 *
 * We do two things:
 *  1. Inline the SVG so we can edit its DOM.
 *  2. On every resize, recompute `stroke-width` on every stroked
 *     element so the visual thickness stays at `visualStroke` px,
 *     scaled proportionally with the rendered size.
 */
export default function BrandLogo({
  src,
  alt = "",
  visualStroke = 1.75,
  className = "",
}: BrandLogoProps) {
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  // Fetch the SVG source once.
  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        if (!cancelled) setSvgMarkup(text);
      })
      .catch(() => {
        if (!cancelled) setSvgMarkup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  // After the SVG mounts, observe size changes and rewrite stroke-width.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !svgMarkup) return;

    const svg = wrap.querySelector("svg");
    if (!svg) return;

    // Force responsive sizing.
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    (svg as SVGElement).style.width = "100%";
    (svg as SVGElement).style.height = "100%";
    (svg as SVGElement).style.display = "block";

    // Read viewBox to compute the SVG's intrinsic coordinate scale.
    const vb = svg.viewBox?.baseVal;
    const vbW = vb && vb.width ? vb.width : 100;
    const vbH = vb && vb.height ? vb.height : 100;

    const stroked = Array.from(
      svg.querySelectorAll(
        "path, line, polyline, polygon, rect, circle, ellipse, g[stroke]",
      ),
    ) as SVGElement[];

    // Cache: if an element wasn't originally stroked, leave it alone.
    const originallyStroked = stroked.filter((el) => {
      const stroke =
        el.getAttribute("stroke") ||
        getComputedStyle(el).stroke;
      return stroke && stroke !== "none";
    });

    const update = () => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // How many SVG user units fit in 1 CSS pixel after rendering.
      const unitsPerPx = Math.max(vbW / rect.width, vbH / rect.height);
      const targetWidth = visualStroke * unitsPerPx;
      originallyStroked.forEach((el) => {
        el.setAttribute("stroke-width", String(targetWidth));
        // Force the stroke to participate in the user-coordinate
        // scaling rather than be locked to 1 device px.
        el.style.vectorEffect = "non-scaling-stroke";
        // ...except we DO want it to respond to zoom: revert that
        // and rely on our recompute-on-resize instead.
        el.style.vectorEffect = "";
      });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    window.addEventListener("resize", update);
    // Browser zoom doesn't always fire resize; listen to visualViewport too.
    const vv = (window as Window & { visualViewport?: VisualViewport })
      .visualViewport;
    vv?.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      vv?.removeEventListener("resize", update);
    };
  }, [svgMarkup, visualStroke]);

  if (!svgMarkup) {
    // Render a same-size placeholder while loading so layout doesn't shift.
    return (
      <span
        className={`inline-block ${className}`}
        aria-label={alt}
        role="img"
      />
    );
  }

  return (
    <span
      ref={wrapRef}
      className={`inline-block ${className}`}
      aria-label={alt}
      role="img"
      // Inline the SVG so we can mutate its DOM.
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
