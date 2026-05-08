import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import CmsLink from "@/components/CmsLink";
import PrismicImage from "@/components/PrismicImage";
import { getContextualCtaAriaLabel, getDescriptiveCtaLabel } from "@/lib/a11y";
import { resolveLinkHref } from "@/lib/links";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import { getUiCopy } from "@/lib/ui-copy";
import { HeroSlice } from "@/../prismicio-types";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<HeroSlice, HotcSliceContext>;

/**
 * Component for "Hero" Slices.
 */
const Hero = ({ slice, context }: HeroProps) => {
  const locale = getSliceLocale(context);
  const copy = getUiCopy(locale);
  const primary = slice.primary as HeroSlice["primary"] & {
    background_image?: HeroSlice["primary"]["image"];
    bgImage?: HeroSlice["primary"]["image"];
    hero_image?: HeroSlice["primary"]["image"];
  };
  const heroImage =
    (primary.image?.url ? primary.image : null) ??
    (primary.background_image?.url ? primary.background_image : null) ??
    (primary.bgImage?.url ? primary.bgImage : null) ??
    (primary.hero_image?.url ? primary.hero_image : null);
  const heroTitle = primary.title?.trim() || copy.images.heroArtworkAlt;
  const ctaAriaLabel = getContextualCtaAriaLabel(primary.cta_label, heroTitle, locale);
  const ctaHref = resolveLinkHref(primary.cta_link);
  const ctaLabel = getDescriptiveCtaLabel(primary.cta_label, ctaHref);

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hotc-hero hotc-hero--lg"
    >
      {heroImage?.url && (
        <div className="hotc-hero__bg">
          <PrismicImage
            field={heroImage}
            fallbackAlt={heroTitle}
            fill
            sizes="100vw"
            decoding="async"
            fetchPriority="high"
            loading="eager"
            quality={60}
            className="hotc-hero__bg-img"
          />
        </div>
      )}
      <div className="hotc-hero__overlay" />
      <Bounded className="hotc-hero__inner" yPadding="none">
        {primary.kicker && <span className="hotc-kicker hotc-hero__kicker">{primary.kicker}</span>}
        {primary.title && <h1 className="hotc-hero__title">{primary.title}</h1>}
        {primary.subtitle && (
          <div className="hotc-hero__subtitle">
            <p>{primary.subtitle}</p>
          </div>
        )}
        {primary.cta_label && (
          <div className="hotc-hero__ctas">
            <CmsLink
              linkField={primary.cta_link}
              locale={locale}
              className="hotc-btn hotc-btn--ember"
              aria-label={ctaLabel === primary.cta_label ? ctaAriaLabel : undefined}
            >
              {ctaLabel}
            </CmsLink>
          </div>
        )}
      </Bounded>
    </section>
  );
};

export default Hero;
