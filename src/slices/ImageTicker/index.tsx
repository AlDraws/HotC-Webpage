"use client";

import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import clsx from "clsx";
import { useEffect, useRef } from "react";

export type ImageTickerProps = SliceComponentProps<Content.ImageTickerSlice>;

type Props = ImageTickerProps;

const sizeClassByItem = (size: string | null | undefined) =>
  size === "sm"
    ? "h-14 w-14 md:h-16 md:w-16"
    : size === "lg"
    ? "h-24 w-24 md:h-28 md:w-28"
    : "h-20 w-20 md:h-24 md:w-24"; // md por defecto

// Utils de color para modo "auto"
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return { r, g, b };
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
};

const rgbStringToRgb = (str: string): { r: number; g: number; b: number } | null => {
  const m = str
    .trim()
    .match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1))?\s*\)$/i);
  if (!m) return null;
  const r = Math.max(0, Math.min(255, Number(m[1])));
  const g = Math.max(0, Math.min(255, Number(m[2])));
  const b = Math.max(0, Math.min(255, Number(m[3])));
  return { r, g, b };
};

const getAutoTextColor = (bg: string | undefined | null): string | undefined => {
  if (!bg || typeof bg !== "string") return undefined;
  let rgb: { r: number; g: number; b: number } | null = null;
  if (bg.startsWith("#")) rgb = hexToRgb(bg);
  else if (bg.toLowerCase().startsWith("rgb")) rgb = rgbStringToRgb(bg);
  // Si no se puede parsear, fallback a undefined
  if (!rgb) return undefined;
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 128 ? "#111111" : "#FFFFFF";
};

export default function ImageTicker({ slice }: Props) {
  const p = slice.primary as any;

  // Logs de depuración (solo en dev)
  if (process.env.NODE_ENV !== "production") {
    console.log("[ImageTicker] first items:", (slice.items ?? []).slice(0, 2));
    if ((p as any)?.items) {
      console.log("[ImageTicker] first primary.items:", ((p as any).items ?? []).slice(0, 2));
    }
  }

  // Compatibilidad: items pueden vivir en slice.items (zona repetible)
  // o en slice.primary.items (Group en Primary). Si hay items en primary,
  // se priorizan, ya que slice.items suele existir como [] por defecto.
  const repeatItems = Array.isArray((slice as any).items)
    ? ((slice as any).items as any[])
    : [];
  const primaryGroupItems = Array.isArray((p as any)?.items)
    ? (((p as any).items as any[]) ?? [])
    : [];
  const rawItems = primaryGroupItems.length > 0 ? primaryGroupItems : repeatItems;

  // Ahora permitimos ítems sin link; solo exigimos imagen.
  const items = (rawItems as any[]).filter((it: any) => isFilled.image((it as any).image));

  const speed = Number(p.speed_sec) > 0 ? Number(p.speed_sec) : 30;
  const direction = p.direction === "right" ? "right" : "left";
  const itemSize = p.item_size ?? "md";
  const pauseOnHover = p.pause_on_hover !== false; // por defecto true

  // Un solo set visible; añadimos un gap off-screen y una copia para loop sin saltos.
  const loop = [...items];

  // Permitir configurar el gap entre imágenes (px) desde Prismic (primary.image_gap_px)
  const imageGapPxOverride = Number((p as any)?.image_gap_px);
  const imageGapStyle = Number.isFinite(imageGapPxOverride) && imageGapPxOverride > 0
    ? ({ gap: `${imageGapPxOverride}px` } as React.CSSProperties)
    : undefined;

  // Color del subtítulo: manual o auto en función del bg
  // Campos soportados:
  // - primary.text_color_mode = "auto" | "manual" (opcional)
  // - primary.text_color / text_color_hex / subtitle_color (string CSS) para modo manual
  const textColorMode = String((p as any)?.text_color_mode || (p as any)?.subtitle_color_mode || "").toLowerCase();
  const textColorRaw = (p as any)?.text_color ?? (p as any)?.text_color_hex ?? (p as any)?.subtitle_color;
  const preferAuto = textColorMode === "auto" || (typeof textColorRaw === "string" && textColorRaw.trim().toLowerCase() === "auto");
  const manualColor = typeof textColorRaw === "string" && textColorRaw.trim() && textColorRaw.trim().toLowerCase() !== "auto"
    ? textColorRaw.trim()
    : undefined;
  const autoColor = getAutoTextColor((p as any)?.bg_color);
  const finalSubtitleColor = preferAuto ? autoColor : manualColor;
  const subtitleStyle = finalSubtitleColor
    ? ({ color: finalSubtitleColor } as React.CSSProperties)
    : undefined;

  // Permitir configurar el gap entre tiras desde Prismic
  // - En vw: primary.strip_gap_vw (por ejemplo, 40 => 40vw)
  // - En px: primary.strip_gap_px (fallback)
  const stripGapVwOverride = Number((p as any)?.strip_gap_vw);
  const stripGapPxOverride = Number((p as any)?.strip_gap_px);

  // Centrado: calculamos un offset inicial para que, si el track
  // base (sin duplicar) es más estrecho que el contenedor, arranque
  // visualmente centrado. El keyframe usa --marquee-offset.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const baseRef = useRef<HTMLUListElement | null>(null);
  // Drag state refs
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const startVar0Ref = useRef(0);
  const endVar0Ref = useRef(0);
  const suppressClickRef = useRef(false);

  // Recalcular en resize y cuando cambie el número de items o tamaños
  useEffect(() => {
    const el = containerRef.current;
    const base = baseRef.current;
    const track = trackRef.current;
    if (!el || !base || !track) return;

    const calc = () => {
      // Medidas
      const baseWidth = base.scrollWidth; // ancho del set real
      // Usamos el ancho del viewport (no el del body/contenedor) para evitar saltos
      const containerWidth = window.innerWidth;

      // Posición inicial centrada
      const start = (containerWidth - baseWidth) / 2;

      // Offset entre tiras: configurable (vw tiene prioridad), si no px, si no cálculo default
      let gapPx: number;
      let gapVar: string; // para el espaciador visual
      if (Number.isFinite(stripGapVwOverride) && stripGapVwOverride >= 0) {
        gapPx = (containerWidth * stripGapVwOverride) / 100;
        gapVar = `${stripGapVwOverride}vw`;
      } else if (Number.isFinite(stripGapPxOverride) && stripGapPxOverride >= 0) {
        gapPx = stripGapPxOverride;
        gapVar = `${stripGapPxOverride}px`;
      } else {
        gapPx = Math.max(containerWidth / 2, 64);
        gapVar = `${gapPx}px`;
      }

      // Distancia total a recorrer antes de reiniciar (set + gap)
      const distance = baseWidth + gapPx;

      // Dirección: izquierda => end = start - distance; derecha => end = start + distance
      const end = direction === "right" ? start + distance : start - distance;

      // Aplicar variables en el track animado
      track.style.setProperty("--marquee-start", `${start}px`);
      track.style.setProperty("--marquee-end", `${end}px`);
      track.style.setProperty("--marquee-speed", `${speed}s`);
      track.style.setProperty("--marquee-gap", gapVar);
    };

    // Calcular tras un frame por si aún se han renderizado imágenes
    const r1 = requestAnimationFrame(calc);
    const r2 = setTimeout(calc, 300);
    window.addEventListener("resize", calc);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(r2 as unknown as number);
      window.removeEventListener("resize", calc);
    };
  }, [items.length, itemSize, direction, speed, stripGapPxOverride, stripGapVwOverride]);

  // Handlers: arrastrar para desplazar izquierda/derecha (PC + móvil)
  const onPointerDown = (e: any) => {
    const track = trackRef.current;
    if (!track) return;
    draggingRef.current = true;
    suppressClickRef.current = false;
    if (track.setPointerCapture) {
      try { track.setPointerCapture(e.pointerId); } catch {}
    }
    pointerIdRef.current = e.pointerId ?? null;
    dragStartXRef.current = e.clientX ?? 0;
    // Pausar la animación mientras se arrastra
    (track.style as any).animationPlayState = "paused";
    track.style.cursor = "grabbing";
    // Leer variables actuales (px)
    const startVarStr = track.style.getPropertyValue("--marquee-start");
    const endVarStr = track.style.getPropertyValue("--marquee-end");
    const start0 = parseFloat(startVarStr) || 0;
    const end0 = parseFloat(endVarStr) || 0;
    startVar0Ref.current = start0;
    endVar0Ref.current = end0;
  };

  const onPointerMove = (e: any) => {
    if (!draggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = (e.clientX ?? 0) - dragStartXRef.current;
    if (Math.abs(dx) > 4) suppressClickRef.current = true;
    const newStart = startVar0Ref.current + dx;
    const newEnd = endVar0Ref.current + dx;
    track.style.setProperty("--marquee-start", `${newStart}px`);
    track.style.setProperty("--marquee-end", `${newEnd}px`);
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const track = trackRef.current;
    if (track) {
      if (track.releasePointerCapture && pointerIdRef.current != null) {
        try { track.releasePointerCapture(pointerIdRef.current); } catch {}
      }
      (track.style as any).animationPlayState = "running";
      track.style.cursor = "grab";
    }
  };

  const onClickCapture = (e: any) => {
    if (suppressClickRef.current) {
      e.preventDefault?.();
      e.stopPropagation?.();
      suppressClickRef.current = false;
    }
  };

  if (items.length === 0) {
    return (
      <section data-slice-type="image_ticker" className="py-6">
        <div className="mx-auto max-w-screen-md rounded bg-red-50 p-4 text-red-700">
          ImageTicker: sin items válidos (falta image).{' '}
          Count slice.items: {(slice.items ?? []).length}{' '}
          · Count primary.items: {Array.isArray((p as any)?.items) ? (p as any).items.length : 0}
        </div>
      </section>
    );
  }

  return (
    <section
      className={clsx("relative", pauseOnHover && "hotc-hover-pause")}
      style={{ backgroundColor: p.bg_color || "transparent" }}
      aria-label="Links destacados"
    >
      {/* Contenedor full-bleed: ocupa todo el viewport, no solo el cuerpo */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
      >
        {/* Track animado */}
        <div
          ref={trackRef}
          className={clsx("hotc-marquee flex w-max items-center py-4 md:py-6")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          style={{ touchAction: "pan-y", cursor: "grab" }}
          aria-hidden={false}
        >
          {/* Set base visible */}
          <ul
            ref={baseRef}
            className="flex w-max items-center gap-6 md:gap-8"
            role="list"
            style={imageGapStyle}
          >
            {loop.map((it, idx) => {
            const I = it as any;
            const classForImg = clsx(
              "aspect-square shrink-0 rounded-md bg-white/5",
              sizeClassByItem(itemSize),
              I.contain ? "object-contain p-1" : "object-cover"
            );

            return (
              <li key={idx} className="inline-flex flex-col items-center">
                {isFilled.link(I.link) ? (
                  <PrismicNextLink
                    field={I.link}
                    className="inline-flex flex-col items-center no-underline"
                  >
                    <PrismicNextImage
                      field={I.image}
                      className={classForImg}
                      alt={I?.image?.alt || I?.subtitle || ""}
                      priority={false}
                      sizes="(min-width: 1024px) 128px, 20vw"
                      quality={85}
                    />
                    {isFilled.keyText(I.subtitle) && (
                      <span className="mt-2 text-xs md:text-sm text-slate-200/80" style={subtitleStyle}>
                        {I.subtitle}
                      </span>
                    )}
                  </PrismicNextLink>
                ) : (
                  <div className="inline-flex flex-col items-center">
                    <PrismicNextImage
                      field={I.image}
                      className={classForImg}
                      alt={I?.image?.alt || I?.subtitle || ""}
                      priority={false}
                      sizes="(min-width: 1024px) 128px, 20vw"
                      quality={85}
                    />
                    {isFilled.keyText(I.subtitle) && (
                      <span className="mt-2 text-xs md:text-sm text-slate-200/80" style={subtitleStyle}>
                        {I.subtitle}
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
            })}
          </ul>
          <div aria-hidden className="shrink-0" style={{ width: "var(--marquee-gap)" }} />
          <ul
            className="flex w-max items-center gap-6 md:gap-8"
            aria-hidden
            role="list"
            style={imageGapStyle}
          >
            {loop.map((it, idx) => {
              const I = it as any;
              const classForImg = clsx(
                "aspect-square shrink-0 rounded-md bg-white/5",
                sizeClassByItem(itemSize),
                I.contain ? "object-contain p-1" : "object-cover"
              );
              return (
                <li key={`clone-${idx}`} className="inline-flex flex-col items-center">
                  <div className="inline-flex flex-col items-center">
                    <PrismicNextImage
                      field={I.image}
                      className={classForImg}
                      alt={I?.image?.alt || I?.subtitle || ""}
                      priority={false}
                      sizes="(min-width: 1024px) 128px, 20vw"
                      quality={85}
                    />
                    {isFilled.keyText(I.subtitle) && (
                      <span className="mt-2 text-xs md:text-sm text-slate-200/80" style={subtitleStyle}>
                        {I.subtitle}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
