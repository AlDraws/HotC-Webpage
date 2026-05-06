import { Metadata } from "next";
import Link from "next/link";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { normalizeSlices } from "@/lib/prismic-slices";
import { getRequestPrismicLang } from "@/lib/server-locale";

export const metadata: Metadata = {
  title: "Characters",
  description: "Meet the cast of Heirs of the Collapse.",
};

/**
 * Characters index — replicates the App.jsx "characters" route:
 *   - Page head (kicker, h1, intro)
 *   - CharacterGrid with hotc-cgrid__* classes from CharacterGrid.jsx
 */
export default async function CharactersPage() {
  const lang = await getRequestPrismicLang();
  const client = createClient();
  const charactersPage = await client
    .getByUID("page", "characters", { lang })
    .catch(() => null);
  const characters = await client.getAllByType("character", { lang });
  const normalizedPageSlices = normalizeSlices(charactersPage?.data.slices);

  const heroSliceFromPage =
    normalizedPageSlices.find((slice) => slice.slice_type === "parallax_hero") ??
    null;

  const fallbackHeroSlice = {
    id: "characters-default-parallax",
    slice_type: "parallax_hero",
    slice_label: null,
    variation: "default",
    version: "initial",
    primary: {
      kicker: "The Cast",
      title: "Characters",
      subtitle: "The heirs, the lost, and the ones who stayed.",
      bgImage: {},
      bgVideo: {},
      bgPoster: {},
      foreground: {},
      bgStrength: null,
      fgStrength: null,
      height_vh: 56,
      primaryCtaLabel: "",
      primaryCtaLink: {},
      secondaryCtaLabel: "",
      secondaryCtaLink: {},
      size: "lg",
      overlay: "strong",
    },
    items: [],
  };
  const heroSlice = heroSliceFromPage ?? fallbackHeroSlice;

  return (
    <>
      <SliceZone slices={[heroSlice]} components={components} />

      {/* Character grid — replicates CharacterGrid.jsx */}
      <section className="bounded bounded--base" style={{ paddingTop: 0 }}>
        <div className="hotc-cgrid__grid">
          {characters.map((ch) => (
            <Link
              key={ch.id}
              href={`/characters/${ch.uid}`}
              className="hotc-cgrid__cell hotc-pressable"
            >
              <div
                className="hotc-cgrid__portrait"
                style={
                  ch.data.portrait?.url
                    ? { backgroundImage: `url(${ch.data.portrait.url})` }
                    : undefined
                }
              />
              <div className="hotc-cgrid__meta">
                {ch.data.role ? (
                  <span className="hotc-cgrid__role">{ch.data.role}</span>
                ) : null}
                <span className="hotc-cgrid__name">{ch.data.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
