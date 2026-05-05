import { Metadata } from "next";
import { PrismicNextImage } from "@prismicio/next";
import { asText } from "@prismicio/client";
import Link from "next/link";
import { createClient } from "@/prismicio";

export const metadata: Metadata = {
  title: "Episodes — Heirs of the Collapse",
  description: "Read every chapter of Heirs of the Collapse, a webcomic updating every Sunday.",
};

export default async function EpisodesPage() {
  const client = createClient();
  const episodes = await client.getAllByType("episode", {
    orderings: [{ field: "my.episode.chapter_number", direction: "desc" }],
  });

  return (
    <>
      {/* Page head — replicates EpisodeIndex.jsx header */}
      <section className="bounded hotc-page__head">
        <span className="hotc-kicker">Archive</span>
        <h1 className="hotc-h1">Episodes</h1>
        <p className="hotc-page__intro">
          Read the story from the beginning, or jump to the latest chapter.
        </p>
      </section>

      {/* Episode grid — replicates EpisodeIndex.jsx grid */}
      <section className="bounded bounded--base" style={{ paddingTop: 0 }}>
        <div className="hotc-eidx__grid">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/episodes/${ep.uid}`}
              className="hotc-ep-card"
            >
              {/* Cover */}
              <div className="hotc-ep-card__cover">
                {ep.data.cover?.url ? (
                  <PrismicNextImage
                    field={ep.data.cover}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    fallbackAlt=""
                  />
                ) : null}
              </div>

              {/* Meta */}
              <div>
                <span className="hotc-ep-card__date">
                  CH. {ep.data.chapter_number ?? "—"}&nbsp;·&nbsp;
                  {ep.data.publish_date ?? ""}
                </span>
                <h3 className="hotc-ep-card__title">{ep.data.title}</h3>
                {ep.data.summary ? (
                  <p className="hotc-ep-card__synopsis">
                    {asText(ep.data.summary)}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
