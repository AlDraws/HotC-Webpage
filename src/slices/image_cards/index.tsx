"use client";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";

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
        {slice.items.map((item, index) => (
          <article key={index} className="hotc-icard">
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
          </article>
        ))}
      </div>
    </Bounded>
  );
};

export default ImageCards;
