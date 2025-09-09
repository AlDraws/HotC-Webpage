import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import clsx from "clsx";

export type ImageTickerProps = SliceComponentProps<Content.ImageTickerSlice>;

type Props = ImageTickerProps;

const sizeClassByItem = (size: string | null | undefined) =>
  size === "sm"
    ? "h-14 w-14 md:h-16 md:w-16"
    : size === "lg"
    ? "h-24 w-24 md:h-28 md:w-28"
    : "h-20 w-20 md:h-24 md:w-24"; // md por defecto

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

  const items = (rawItems as any[]).filter(
    (it: any) => isFilled.link((it as any).link) && isFilled.image((it as any).image)
  );

  if (items.length === 0) {
    return (
      <section data-slice-type="image_ticker" className="py-6">
        <div className="mx-auto max-w-screen-md rounded bg-red-50 p-4 text-red-700">
          ImageTicker: sin items válidos (faltan link o image).{' '}
          Count slice.items: {(slice.items ?? []).length}{' '}
          · Count primary.items: {Array.isArray((p as any)?.items) ? (p as any).items.length : 0}
        </div>
      </section>
    );
  }

  const speed = Number(p.speed_sec) > 0 ? Number(p.speed_sec) : 30;
  const direction = p.direction === "right" ? "right" : "left";
  const itemSize = p.item_size ?? "md";
  const pauseOnHover = p.pause_on_hover !== false; // por defecto true

  // Duplicamos para scroll sin cortes
  const loop = [...items, ...items];

  return (
    <section
      className={clsx("relative", pauseOnHover && "hotc-hover-pause")}
      style={{ backgroundColor: p.bg_color || "transparent" }}
      aria-label="Links destacados"
    >
      <div className="mx-auto w-full overflow-hidden">
        <ul
          className={clsx(
            "hotc-marquee flex w-max items-center gap-6 py-4 md:gap-8 md:py-6",
            direction === "right" && "hotc-marquee--right"
          )}
          style={{ ["--marquee-speed" as string]: `${speed}s` }}
          role="list"
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
                    <span className="mt-2 text-xs md:text-sm text-slate-200/80">
                      {I.subtitle}
                    </span>
                  )}
                </PrismicNextLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
