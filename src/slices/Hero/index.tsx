"use client";

import { FC } from "react";
import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import type { SliceComponentProps, JSXMapSerializer } from "@prismicio/react";

import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { PrismicRichText } from "@/components/PrismicRichText";
import { useParallax } from "@/hooks/useParallax";

const components: JSXMapSerializer = {
  heading1: ({ children }) => (
    <Heading as="h2" size="xl" className="mb-4 mt-12 first:mt-0 last:mb-0">
      {children}
    </Heading>
  ),
};

type HeroProps = SliceComponentProps<Content.HeroSlice>;

const Hero: FC<HeroProps> = ({ slice }) => {
  const backgroundImage = slice.primary.backgroundImage;
  const logo = (slice.primary as any).logo;

  const { ref: parallaxRef, style: parallaxStyle } = useParallax({
    strength: 0.12,
    max: 48,
    pointerStrength: { x: 18, y: 6 },
    mode: "both",
    scale: 1.18,
    disablePointerBelow: 768,
  });

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      {isFilled.image(backgroundImage) && (
        <div ref={parallaxRef as any} className="pointer-events-none absolute inset-0">
          <PrismicNextImage
            field={backgroundImage}
            alt=""
            fill={true}
            className="select-none object-cover opacity-40"
            style={parallaxStyle}
            priority
          />
        </div>
      )}
      <Bounded className="relative py-8">
        <div className="grid justify-items-center gap-3">
          <div className="max-w-2xl text-center">
            {isFilled.image(logo) ? (
              <PrismicNextImage
                field={logo}
                className="mx-auto h-80px w-auto md:h-80px"
                fallbackAlt=""
                priority
              />
            ) : (
              <PrismicRichText field={slice.primary.text} components={components} />
            )}
          </div>
          {isFilled.link(slice.primary.buttonLink) && (
            <PrismicNextLink
              field={slice.primary.buttonLink}
              className="rounded-sm bg-white px-5 py-3 font-medium text-slate-800"
            >
              {slice.primary.buttonText || "Learn More"}
            </PrismicNextLink>
          )}
        </div>
      </Bounded>
    </section>
  );
};

export default Hero;
