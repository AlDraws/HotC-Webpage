"use client";

import { FC } from "react";
import { Content, isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { type JSXMapSerializer, SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";

import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { PrismicRichText } from "@/components/PrismicRichText";
import { useParallax } from "@/hooks/useParallax";

export type HeroProjectProps = SliceComponentProps<Content.HeroProjectSlice>;

const richComponents: JSXMapSerializer = {
  heading1: ({ children }) => (
    <Heading as="h1" size="xl" className="mb-4 mt-6 first:mt-0 last:mb-0">
      {children}
    </Heading>
  ),
  paragraph: ({ children }) => (
    <p className="text-lg md:text-xl text-slate-100/90">{children}</p>
  ),
};

const overlayClass = (o?: string | null) =>
  o === "soft" ? "bg-black/40" : o === "strong" ? "bg-black/70" : "bg-transparent";

const HeroProject: FC<HeroProjectProps> = ({ slice }) => {
  const isLeft = slice.variation === "left";
  const p: any = slice.primary as any;
  const bg = isLeft ? p.background_image : p.key_art;
  const align: "left" | "center" = isLeft && p.align === "center" ? "center" : "left";

  const { ref: parallaxRef, style: parallaxStyle } = useParallax({
    strength: 0.12,
    max: 48,
    pointerStrength: { x: 18, y: 6 },
    mode: "both",
    scale: 1.18,
    disablePointerBelow: 768,
  });

  return (
    <section className={clsx("relative overflow-hidden text-white", !isFilled.image(bg) && "bg-slate-900")}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      {isFilled.image(bg) && (
        <div ref={parallaxRef as any} className="pointer-events-none absolute inset-0">
          <PrismicNextImage
            field={bg}
            alt=""
            fill
            className="select-none object-cover"
            style={parallaxStyle}
            priority
          />
          <div className={clsx("absolute inset-0", overlayClass(p.overlay))} />
        </div>
      )}

      <Bounded as="section" className="relative py-16 md:py-24">
        <div
          className={clsx(
            "grid gap-4",
            align === "center" ? "justify-items-center text-center" : "justify-items-start text-left",
          )}
        >
          {isFilled.keyText(p.kicker) && (
            <span className="uppercase tracking-wide text-sm text-slate-200/90">{p.kicker}</span>
          )}

          {isFilled.richText(p.title) ? (
            <PrismicRichText field={p.title} components={richComponents} />
          ) : null}

          {isFilled.richText(p.subtitle) ? (
            <div className={clsx("max-w-3xl", align === "center" ? "mx-auto" : "")}>
              <PrismicRichText field={p.subtitle} components={richComponents} />
            </div>
          ) : null}

          {isFilled.link(p.cta_link) && (
            <div className="mt-4">
              <PrismicNextLink
                field={p.cta_link}
                className="inline-block rounded-sm bg-white px-5 py-3 font-medium text-slate-800 no-underline"
              >
                {p.cta_label || "Learn More"}
              </PrismicNextLink>
            </div>
          )}
        </div>
      </Bounded>
    </section>
  );
};

export default HeroProject;
