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

  const items = (slice.items ?? []).filter(
    (it) => isFilled.link((it as any).link) && isFilled.image((it as any).image)
  );
  if (items.length === 0) return null;

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
          style={{ ["--marquee-speed" as any]: `${speed}s` }}
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
                    fallbackAlt=""
                    priority={false}
                    sizes="(min-width: 1024px) 128px, 20vw"
                    imgixParams={{ q: 85, fm: "webp" }}
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
