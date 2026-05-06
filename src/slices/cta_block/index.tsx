import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { CtaBlockSlice } from "@/../prismicio-types";

/**
 * Props for `CtaBlock`.
 */
export type CtaBlockProps = SliceComponentProps<CtaBlockSlice>;

/**
 * Component for "CtaBlock" Slices.
 */
const CtaBlock = ({ slice }: CtaBlockProps) => {
  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      as="section"
    >
      <div className="hotc-cta-block">
        {slice.primary.background_image?.url ? (
          <div className="hotc-cta-block__bg" aria-hidden="true">
            <PrismicNextImage
              field={slice.primary.background_image}
              fallbackAlt=""
              fill
              sizes="100vw"
              className="hotc-cta-block__bg-img"
            />
          </div>
        ) : null}

        <div className="hotc-cta-block__content">
          <div className="hotc-cta-block__text">
            <h2>{slice.primary.title}</h2>
            {slice.primary.description && <p>{slice.primary.description}</p>}
          </div>
          {slice.primary.cta_label && (
            <div className="hotc-cta-block__action">
              <PrismicNextLink
                field={slice.primary.cta_link}
                className="hotc-btn hotc-btn--ink"
              >
                {slice.primary.cta_label}
              </PrismicNextLink>
            </div>
          )}
        </div>
      </div>
    </Bounded>
  );
};

export default CtaBlock;
