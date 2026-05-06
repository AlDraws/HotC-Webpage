"use client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { useLightbox } from "@/components/LightboxProvider";
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
              className="hotc-twi__img-trigger"
              onClick={() =>
                openLightbox([
                  {
                    src: slice.primary.image.url || "",
                    alt: slice.primary.image.alt || "",
                  },
                ])
              }
              aria-label="Open image"
            >
              <PrismicNextImage
                field={slice.primary.image}
                className="hotc-twi__img"
                fallbackAlt=""
              />
            </button>
          ) : (
            <PrismicNextImage
              field={slice.primary.image}
              className="hotc-twi__img"
              fallbackAlt=""
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
            >
              {slice.primary.cta_label}
            </PrismicNextLink>
          )}
        </div>
      </div>
    </Bounded>
  );
};

export default TextWithImage;
