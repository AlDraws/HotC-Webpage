import { asLink, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";
import { LoreSectionSlice } from "@/../prismicio-types";
import { isVisibleData } from "@/lib/content-visibility";

/**
 * Props for `LoreSection`.
 */
export type LoreSectionProps = SliceComponentProps<LoreSectionSlice>;
type LoreEntryWithData = NonNullable<
  LoreSectionSlice["items"][number]["entry"]
> & {
  data?: {
    is_visible?: boolean | null;
    title?: string | null;
  };
};

/**
 * Component for "LoreSection" Slices.
 */
const LoreSection = ({ slice }: LoreSectionProps) => {
  const items = slice.items ?? [];

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hotc-lore"
    >
      <div className="hotc-lore__inner">
        <div>
          {slice.primary.kicker && (
            <span
              className="hotc-kicker"
              style={{ display: "block", marginBottom: "0.5rem" }}
            >
              {slice.primary.kicker}
            </span>
          )}
          <h2 className="hotc-h2">{slice.primary.title}</h2>
        </div>

        {items.length > 0 && (
          <ul className="hotc-lore__grid" role="list">
            {items.map((item, i) => {
              const entry = item.entry;
              if (!isFilled.contentRelationship(entry)) return null;
              if (!isVisibleData(entry.data)) return null;
              const enrichedEntry = entry as LoreEntryWithData;
              const title = enrichedEntry.data?.title;

              return (
                <li key={i} className="hotc-lore__card">
                  <PrismicNextLink
                    href={asLink(entry) ?? "#"}
                    className="hotc-lore__card-link"
                  >
                    {/* Si la página padre pasa data enriched vía graphQuery,
                        aquí aparecerán title/cover. Sin graphQuery, solo el uid. */}
                    {title || entry.uid || "—"}
                  </PrismicNextLink>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default LoreSection;
