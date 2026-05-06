"use client";
import { Content } from "@prismicio/client";
import Link from "next/link";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import {
  getLinkTarget,
  isExternalHref,
  resolveLinkHref,
} from "@/lib/links";

/**
 * Props for `ImageCards`.
 */
export type ImageCardsProps = SliceComponentProps<Content.ImageCardsSlice>;

/**
 * Component for "ImageCards" Slices.
 */
const ImageCards = ({ slice }: ImageCardsProps) => {
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
      <div className="hotc-icards">
        {slice.items.map((item, index) => {
          const typedItem = item as typeof item & {
            enlace?: unknown;
            badge?: string | null;
          };
          const linkField = typedItem.enlace;
          const href = resolveLinkHref(linkField);
          const target = getLinkTarget(linkField);
          const isExternal = href ? isExternalHref(href) : false;
          const rel =
            target === "_blank" || isExternal ? "noopener noreferrer" : undefined;
          const badge = typedItem.badge?.trim();

          const card = (
            <>
              <div className="hotc-icard__img-wrap">
                {badge ? <span className="hotc-icard__badge">{badge}</span> : null}
                <div
                  className="hotc-icard__img"
                  style={
                    item.image.url
                      ? { backgroundImage: `url(${item.image.url})` }
                      : undefined
                  }
                />
              </div>
              {item.title && <h3 className="hotc-icard__title">{item.title}</h3>}
              {item.caption && (
                <p className="hotc-icard__caption">{item.caption}</p>
              )}
            </>
          );

          if (href) {
            if (isExternal) {
              return (
                <a
                  key={index}
                  href={href}
                  className="hotc-icard hotc-pressable"
                  target={target ?? "_blank"}
                  rel={rel}
                >
                  {card}
                </a>
              );
            }

            return (
              <Link
                key={index}
                href={href}
                className="hotc-icard hotc-pressable"
                target={target}
                rel={rel}
              >
                {card}
              </Link>
            );
          }

          return (
            <article key={index} className="hotc-icard hotc-pressable">
              {card}
            </article>
          );
        })}
      </div>
    </Bounded>
  );
};

export default ImageCards;
