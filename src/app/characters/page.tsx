import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/prismicio";

export const metadata: Metadata = {
  title: "Characters — Heirs of the Collapse",
  description: "Meet the cast of Heirs of the Collapse.",
};

/**
 * Characters index — replicates the App.jsx "characters" route:
 *   - Page head (kicker, h1, intro)
 *   - CharacterGrid with hotc-cgrid__* classes from CharacterGrid.jsx
 */
export default async function CharactersPage() {
  const client = createClient();
  const characters = await client.getAllByType("character");

  return (
    <>
      {/* Page head */}
      <section className="bounded hotc-page__head">
        <span className="hotc-kicker">The Cast</span>
        <h1 className="hotc-h1">Characters</h1>
        <p className="hotc-page__intro">
          The heirs, the lost, and the ones who stayed.
        </p>
      </section>

      {/* Character grid — replicates CharacterGrid.jsx */}
      <section className="bounded bounded--base" style={{ paddingTop: 0 }}>
        <div className="hotc-cgrid__grid">
          {characters.map((ch) => (
            <Link
              key={ch.id}
              href={`/characters/${ch.uid}`}
              className="hotc-cgrid__cell"
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
