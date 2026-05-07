"use client";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { useLightbox } from "@/components/LightboxProvider";
import PrismicImage from "@/components/PrismicImage";
import { getContextualCtaAriaLabel, getDescriptiveCtaLabel } from "@/lib/a11y";
import { resolveLinkHref } from "@/lib/links";
import { TextWithImageSlice } from "@/../prismicio-types";

/**
 * Props for `TextWithImage`.
 */
export type TextWithImageProps = SliceComponentProps<TextWithImageSlice>;

/**
 * Component for "TextWithImage" Slices.
 */
const TextWithImage = ({ slice }: TextWithImageProps) => {
  const { openLightbox } = useLightbox();
  const imageAlt =
    slice.primary.image.alt ||
    slice.primary.title ||
    slice.primary.kicker ||
    "Editorial image from Heirs of the Collapse";
  const ctaAriaLabel = getContextualCtaAriaLabel(
    slice.primary.cta_label,
    slice.primary.title || slice.primary.kicker,
  );
  const ctaLabel = getDescriptiveCtaLabel(
    slice.primary.cta_label,
    resolveLinkHref(slice.primary.cta_link),
  );

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      as="section"
      className={`hotc-twi ${slice.primary.layout === "right" ? "hotc-twi--reverse" : ""}`}
    >
      <div className="hotc-twi__inner">
        <div className="hotc-twi__media">
          {slice.primary.image.url ? (
            <button
              type="button"
              className="hotc-twi__img-trigger hotc-pressable"
              onClick={() =>
                openLightbox([
                  {
                    src: slice.primary.image.url || "",
                    alt: imageAlt,
                    width: slice.primary.image.dimensions?.width,
                    height: slice.primary.image.dimensions?.height,
                  },
                ])
              }
              aria-label="Open image"
            >
              <PrismicImage
                field={slice.primary.image}
                className="hotc-twi__img"
                fallbackAlt={imageAlt}
                sizes="(max-width: 767px) calc(100vw - 48px), 560px"
                quality={65}
              />
            </button>
          ) : (
            <PrismicImage
              field={slice.primary.image}
              className="hotc-twi__img"
              fallbackAlt={imageAlt}
              sizes="(max-width: 767px) calc(100vw - 48px), 560px"
              quality={65}
            />
          )}
        </div>
        <div className="hotc-twi__copy">
          {slice.primary.kicker && (
            <span className="hotc-kicker">{slice.primary.kicker}</span>
          )}
          {slice.primary.title && <h2 className="hotc-h2">{slice.primary.title}</h2>}
          <div className="hotc-twi__body">
            <PrismicRichText field={slice.primary.text} />
          </div>
          {slice.primary.cta_label && (
            <PrismicNextLink
              field={slice.primary.cta_link}
              className="hotc-btn hotc-btn--ink"
              aria-label={ctaLabel === slice.primary.cta_label ? ctaAriaLabel : undefined}
            >
              {ctaLabel}
            </PrismicNextLink>
          )}
        </div>
      </div>
    </Bounded>
  );
};

export default TextWithImage;
