import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import CmsLink from "@/components/CmsLink";
import { getContextualCtaAriaLabel, getDescriptiveCtaLabel } from "@/lib/a11y";
import { resolveLinkHref } from "@/lib/links";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import { getUiCopy } from "@/lib/ui-copy";
import { TextWithImageSlice } from "@/../prismicio-types";
import LightboxImageButton from "./LightboxImageButton";

export type TextWithImageProps = SliceComponentProps<TextWithImageSlice, HotcSliceContext>;

const TextWithImage = ({ slice, context }: TextWithImageProps) => {
  const locale = getSliceLocale(context);
  const copy = getUiCopy(locale);
  const imageAlt =
    slice.primary.image.alt ||
    slice.primary.title ||
    slice.primary.kicker ||
    copy.images.editorialImageAlt;
  const ctaAriaLabel = getContextualCtaAriaLabel(
    slice.primary.cta_label,
    slice.primary.title || slice.primary.kicker,
    locale
  );
  const ctaLabel = getDescriptiveCtaLabel(
    slice.primary.cta_label,
    resolveLinkHref(slice.primary.cta_link)
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
          <LightboxImageButton
            field={slice.primary.image}
            alt={imageAlt}
            ariaLabel={copy.common.openImage}
            className="hotc-twi__img"
            sizes="(max-width: 767px) calc(100vw - 48px), 560px"
            quality={55}
          />
        </div>
        <div className="hotc-twi__copy">
          {slice.primary.kicker && <span className="hotc-kicker">{slice.primary.kicker}</span>}
          {slice.primary.title && <h2 className="hotc-h2">{slice.primary.title}</h2>}
          <div className="hotc-twi__body">
            <PrismicRichText field={slice.primary.text} />
          </div>
          {slice.primary.cta_label && (
            <CmsLink
              linkField={slice.primary.cta_link}
              locale={locale}
              className="hotc-btn hotc-btn--ink"
              aria-label={ctaLabel === slice.primary.cta_label ? ctaAriaLabel : undefined}
            >
              {ctaLabel}
            </CmsLink>
          )}
        </div>
      </div>
    </Bounded>
  );
};

export default TextWithImage;
