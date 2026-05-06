"use client";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";

/**
 * Props for `ImageCards`.
 */
export type ImageCardsProps = SliceComponentProps<Content.ImageCardsSlice>;

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
          const href = getLinkHref((item as { enlace?: unknown }).enlace);

          const card = (
            <>
              <div
                className="hotc-icard__img"
                style={
                  item.image.url
                    ? { backgroundImage: `url(${item.image.url})` }
                    : undefined
                }
              />
              {item.title && <h3 className="hotc-icard__title">{item.title}</h3>}
              {item.caption && (
                <p className="hotc-icard__caption">{item.caption}</p>
              )}
            </>
          );

          if (href) {
            return (
              <a key={index} href={href} className="hotc-icard">
                {card}
              </a>
            );
          }

          return (
            <article key={index} className="hotc-icard">
              {card}
            </article>
          );
        })}
      </div>
    </Bounded>
  );
};

export default ImageCards;
