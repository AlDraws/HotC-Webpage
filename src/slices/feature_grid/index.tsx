import Link from "next/link";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import PrismicImage from "@/components/PrismicImage";
import { FeatureGridSlice } from "@/../prismicio-types";
import {
  getLinkTarget,
  isExternalHref,
  resolveLinkHref,
} from "@/lib/links";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import { formatUiText, getUiCopy } from "@/lib/ui-copy";
import ZoomButton from "./ZoomButton";

export type FeatureGridProps = SliceComponentProps<FeatureGridSlice, HotcSliceContext>;

const FeatureGrid = ({ slice, context }: FeatureGridProps) => {
  const locale = getSliceLocale(context);
  const copy = getUiCopy(locale);

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      as="section"
    >
      {(slice.primary.kicker || slice.primary.title) && (
        <div className="hotc-cgrid__head">
          {slice.primary.kicker && (
            <span className="hotc-kicker">{slice.primary.kicker}</span>
          )}
          {slice.primary.title && <h2>{slice.primary.title}</h2>}
        </div>
      )}
      <div className="hotc-fgrid">
        {slice.items.map((item, index) => {
          const typedItem = item as typeof item & {
            cover_image?: typeof item.icon;
            cover_link?: unknown;
          };
          const hasDedicatedCover = Boolean(typedItem.cover_image?.url);
          const coverImage = hasDedicatedCover ? typedItem.cover_image : item.icon;
          const coverHref = resolveLinkHref(typedItem.cover_link);
          const coverTarget = getLinkTarget(typedItem.cover_link);
          const isExternal = coverHref ? isExternalHref(coverHref) : false;
          const rel =
            coverTarget === "_blank" || isExternal
              ? "noopener noreferrer"
              : undefined;
          const featureTitle =
            item.title?.trim() || formatUiText(copy.images.featureTitle, { index: index + 1 });
          const coverAlt = coverImage?.alt || featureTitle;

          const content = (
            <>
              {coverImage?.url ? (
                <div className="hotc-fcard__cover-wrap">
                  <PrismicImage
                    field={coverImage}
                    fallbackAlt={coverAlt}
                    className="hotc-fcard__cover"
                    sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) 31vw, 360px"
                    quality={65}
                  />
                </div>
              ) : null}

              {hasDedicatedCover && item.icon.url ? (
                <div className="hotc-fcard__icon">
                  <PrismicImage
                    field={item.icon}
                    decorative
                    className="h-full w-full object-cover"
                    sizes="64px"
                    quality={60}
                  />
                </div>
              ) : null}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </>
          );

          return (
            <article
              key={index}
              className={`hotc-fcard hotc-fcard--interactive${
                coverHref ? " hotc-fcard--linked" : ""
              }`}
            >
              {coverHref ? (
                isExternal ? (
                  <a
                    href={coverHref}
                    className="hotc-fcard__main-link"
                    target={coverTarget ?? "_blank"}
                    rel={rel}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    href={coverHref}
                    className="hotc-fcard__main-link"
                    target={coverTarget}
                    rel={rel}
                  >
                    {content}
                  </Link>
                )
              ) : (
                <div className="hotc-fcard__main-link">{content}</div>
              )}

              {coverImage?.url ? (
                <ZoomButton
                  image={{
                    src: coverImage.url || "",
                    alt: coverAlt,
                    width: coverImage.dimensions?.width,
                    height: coverImage.dimensions?.height,
                  }}
                  label={formatUiText(copy.images.featureImageAria, {
                    title: item.title || featureTitle,
                  })}
                >
                  {copy.common.viewArtwork}
                </ZoomButton>
              ) : null}
            </article>
          );
        })}
      </div>
    </Bounded>
  );
};

export default FeatureGrid;
