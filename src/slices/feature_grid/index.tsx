"use client";
import type { LinkField } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { useLightbox } from "@/components/LightboxProvider";
import { FeatureGridSlice } from "@/../prismicio-types";

/**
 * Props for `FeatureGrid`.
 */
export type FeatureGridProps = SliceComponentProps<FeatureGridSlice>;

function getLinkHref(linkField: unknown): string | null {
  if (
    linkField &&
    typeof linkField === "object" &&
    "url" in linkField &&
    typeof (linkField as { url?: unknown }).url === "string" &&
    (linkField as { url: string }).url
  ) {
    return (linkField as { url: string }).url;
  }
  return null;
}

/**
 * Component for "FeatureGrid" Slices.
 */
const FeatureGrid = ({ slice }: FeatureGridProps) => {
  const { openLightbox } = useLightbox();

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
          const coverHref = getLinkHref(typedItem.cover_link);
          const coverLinkField = typedItem.cover_link as LinkField | undefined;

          return (
            <article key={index} className="hotc-fcard">
              {coverImage?.url ? (
                <div className="hotc-fcard__cover-wrap">
                  {coverHref ? (
                    <PrismicNextLink
                      field={coverLinkField}
                      className="hotc-btn hotc-btn--ghost hotc-fcard__cover-link"
                    >
                      <PrismicNextImage
                        field={coverImage}
                        fallbackAlt=""
                        className="hotc-fcard__cover"
                      />
                    </PrismicNextLink>
                  ) : (
                    <button
                      type="button"
                      className="hotc-btn hotc-btn--ghost hotc-fcard__cover-link"
                      onClick={() =>
                        openLightbox([
                          {
                            src: coverImage.url || "",
                            alt: coverImage.alt || "",
                          },
                        ])
                      }
                      aria-label={`Open ${item.title || "feature"} cover`}
                    >
                      <PrismicNextImage
                        field={coverImage}
                        fallbackAlt=""
                        className="hotc-fcard__cover"
                      />
                    </button>
                  )}

                  <button
                    type="button"
                    className="hotc-fcard__zoom"
                    onClick={() =>
                      openLightbox([
                        {
                          src: coverImage.url || "",
                          alt: coverImage.alt || "",
                        },
                      ])
                    }
                    aria-label={`Open ${item.title || "feature"} image`}
                  >
                    View
                  </button>
                </div>
              ) : null}

              {hasDedicatedCover && item.icon.url ? (
                <div className="hotc-fcard__icon">
                  <PrismicNextImage
                    field={item.icon}
                    fallbackAlt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </article>
          );
        })}
      </div>
    </Bounded>
  );
};

export default FeatureGrid;
