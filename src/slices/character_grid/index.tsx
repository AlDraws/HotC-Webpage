"use client";

import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";
import { isFilled } from "@prismicio/client";
import { CharacterGridSlice } from "@/../prismicio-types";

export type CharacterGridProps = SliceComponentProps<CharacterGridSlice>;

/**
 * CharacterGrid — grid 2/3/4 col of character portrait cards.
 * Items are content-relationship links to character documents.
 * Faithfully replicates CharacterGrid.jsx from ui_kits/website/.
 */
const CharacterGrid = ({ slice }: CharacterGridProps) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bounded bounded--base"
    >
      {(slice.primary.kicker || slice.primary.title) && (
        <div className="hotc-cgrid__head">
          {slice.primary.kicker && (
            <span className="hotc-kicker">{slice.primary.kicker}</span>
          )}
          {slice.primary.title && (
            <h2 className="hotc-h2">{slice.primary.title}</h2>
          )}
        </div>
      )}
      <div className="hotc-cgrid__grid">
        {slice.items.map((item, index) => {
          const character = item.character;
          if (!isFilled.contentRelationship(character)) return null;
          const data = (character.data ?? {}) as
            | {
                name?: string;
                role?: string;
                portrait?: {
                  url?: string;
                  alt?: string;
                  dimensions?: { width: number; height: number };
                };
              }
            | undefined;
          const portrait =
            data?.portrait ||
            (data as { image?: { url?: string } } | undefined)?.image ||
            undefined;
          const portraitUrl =
            portrait?.url ?? "/assets/character-portrait-placeholder.svg";

          return (
            <PrismicNextLink
              key={index}
              field={character}
              className="hotc-cgrid__cell hotc-pressable"
            >
              <div
                className="hotc-cgrid__portrait"
                style={{ backgroundImage: `url(${portraitUrl})` }}
              />
              <div className="hotc-cgrid__meta">
                {data?.role && (
                  <span className="hotc-cgrid__role">{data?.role}</span>
                )}
                <span className="hotc-cgrid__name">
                  {data?.name ?? character.uid ?? "Unknown"}
                </span>
              </div>
            </PrismicNextLink>
          );
        })}
      </div>
    </section>
  );
};

export default CharacterGrid;
