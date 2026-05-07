import { PrismicNextLink } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import PrismicImage from "@/components/PrismicImage";
import { getContextualCtaAriaLabel, getDescriptiveCtaLabel } from "@/lib/a11y";
import { resolveLinkHref } from "@/lib/links";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import { CtaBlockSlice } from "@/../prismicio-types";

/**
 * Props for `CtaBlock`.
 */
export type CtaBlockProps = SliceComponentProps<CtaBlockSlice, HotcSliceContext>;

/**
 * Component for "CtaBlock" Slices.
 */
const CtaBlock = ({ slice, context }: CtaBlockProps) => {
  const locale = getSliceLocale(context);
  const ctaAriaLabel = getContextualCtaAriaLabel(
    slice.primary.cta_label,
    slice.primary.title,
    locale,
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
    >
      <div className="hotc-cta-block">
        {slice.primary.background_image?.url ? (
          <div className="hotc-cta-block__bg" aria-hidden="true">
            <PrismicImage
              field={slice.primary.background_image}
              decorative
              fill
              sizes="(max-width: 767px) 100vw, 960px"
              quality={60}
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
                aria-label={ctaLabel === slice.primary.cta_label ? ctaAriaLabel : undefined}
              >
                {ctaLabel}
              </PrismicNextLink>
            </div>
          )}
        </div>
      </div>
    </Bounded>
  );
};

export default CtaBlock;
