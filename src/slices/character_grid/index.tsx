import { ImageField, isFilled } from "@prismicio/client";
import Image from "next/image";
import { PrismicNextLink } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import PrismicImage from "@/components/PrismicImage";
import { CharacterGridSlice } from "@/../prismicio-types";
import { isVisibleData } from "@/lib/content-visibility";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import {
  formatUiText,
  getLocalizedCharacterRole,
  getUiCopy,
} from "@/lib/ui-copy";

export type CharacterGridProps = SliceComponentProps<CharacterGridSlice, HotcSliceContext>;

/**
 * CharacterGrid — grid 2/3/4 col of character portrait cards.
 * Items are content-relationship links to character documents.
 * Faithfully replicates CharacterGrid.jsx from ui_kits/website/.
 */
const CharacterGrid = ({ slice, context }: CharacterGridProps) => {
  const locale = getSliceLocale(context);
  const copy = getUiCopy(locale);
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
          if (!isVisibleData(character.data)) return null;
          const data = (character.data ?? {}) as
            | {
                name?: string;
                role?: string;
                portrait?: ImageField;
                image?: ImageField;
                is_visible?: boolean | null;
              }
            | undefined;
          const portrait =
            (data?.portrait?.url ? data.portrait : null) ??
            (data?.image?.url ? data.image : null);

          return (
            <PrismicNextLink
              key={index}
              field={character}
              className="hotc-cgrid__cell hotc-pressable"
            >
              <div className="hotc-cgrid__portrait">
                {portrait ? (
                  <PrismicImage
                    field={portrait}
                    fallbackAlt={formatUiText(copy.character.portraitOf, {
                      name: data?.name ?? character.uid ?? copy.character.fallbackName,
                    })}
                    fill
                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                    quality={65}
                    className="hotc-cgrid__portrait-img"
                  />
                ) : (
                  <Image
                    src="/assets/character-portrait-placeholder.svg"
                    alt=""
                    fill
                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                    className="hotc-cgrid__portrait-img"
                  />
                )}
              </div>
              <div className="hotc-cgrid__meta">
                <span className="hotc-cgrid__name">
                  {data?.name ?? character.uid ?? copy.character.unknownListItem}
                </span>
                {data?.role && (
                  <span className="hotc-cgrid__role">
                    {getLocalizedCharacterRole(data?.role, locale)}
                  </span>
                )}
              </div>
            </PrismicNextLink>
          );
        })}
      </div>
    </section>
  );
};

export default CharacterGrid;
