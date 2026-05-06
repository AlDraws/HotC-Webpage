import { Metadata } from "next";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { asText, type RichTextField } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { normalizeSlices } from "@/lib/prismic-slices";
import { toPrismicLang, type AppLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Characters",
  description: "Meet the cast of Heirs of the Collapse.",
};

function getSliceText(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (Array.isArray(value)) {
    const text = asText(value as RichTextField).trim();
    return text || null;
  }

  return null;
}

/**
 * Characters index:
 *   - Renders any non-grid slices configured on the "characters" page
 *   - Uses CharacterGrid primary fields as the grid heading
 *   - Always lists the current character documents
 */
type Props = { params: Promise<{ locale: AppLocale }> };

export default async function CharactersPage({ params }: Props) {
  const { locale } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const charactersPage = await client
    .getByUID("page", "characters", { lang })
    .catch(() => null);
  const characters = await client.getAllByType("character", { lang });
  const normalizedPageSlices = normalizeSlices(charactersPage?.data.slices);
  const pageSlices = normalizedPageSlices.filter(
    (slice) => slice.slice_type !== "character_grid",
  );
  const characterGridSlice = normalizedPageSlices.find(
    (slice) => slice.slice_type === "character_grid",
  ) as
    | {
        primary?: {
          kicker?: unknown;
          title?: unknown;
        };
      }
    | undefined;
  const gridKicker = getSliceText(characterGridSlice?.primary?.kicker);
  const gridTitle = getSliceText(characterGridSlice?.primary?.title);

  return (
    <>
      <SliceZone slices={pageSlices} components={components} />

      {/* Character grid — replicates CharacterGrid.jsx */}
      <section className="bounded bounded--base" style={{ paddingTop: 0 }}>
        {(gridKicker || gridTitle) && (
          <div className="hotc-cgrid__head">
            {gridKicker && <span className="hotc-kicker">{gridKicker}</span>}
            {gridTitle && <h2 className="hotc-h2">{gridTitle}</h2>}
          </div>
        )}
        <div className="hotc-cgrid__grid">
          {characters.map((ch) => (
            <Link
              key={ch.id}
              href={`/${locale}/characters/${ch.uid}`}
              className="hotc-cgrid__cell hotc-pressable"
            >
              <div className="hotc-cgrid__portrait">
                {ch.data.portrait?.url ? (
                  <PrismicNextImage
                    field={ch.data.portrait}
                    fallbackAlt=""
                    fill
                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                    className="hotc-cgrid__portrait-img"
                  />
                ) : null}
              </div>
              <div className="hotc-cgrid__meta">
                <span className="hotc-cgrid__name">{ch.data.name}</span>
                {ch.data.role ? (
                  <span className="hotc-cgrid__role">{ch.data.role}</span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
