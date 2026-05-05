import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import { asText } from "@prismicio/client";
import { components } from "@/slices";
import Link from "next/link";
import { createClient } from "@/prismicio";

type Props = { params: Promise<{ uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const ep = await client.getByUID("episode", uid).catch(() => null);
  if (!ep) return {};
  return {
    title:
      ep.data.meta_title ??
      `Chapter ${ep.data.chapter_number}: ${ep.data.title}`,
    description: ep.data.meta_description
      ? asText(ep.data.meta_description)
      : undefined,
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const episodes = await client.getAllByType("episode");
  return episodes.map((ep) => ({ uid: ep.uid }));
}

/**
 * Episode reader — webtoon-style vertical scroll.
 * Replicates EpisodeReader.jsx from ui_kits/website/ faithfully:
 *  - Cinema background (hotc-ereader / hotc--cinema)
 *  - Header: back button, chapter label, title, date
 *  - Strip: SliceZone renders episode_panel / episode_text_beat / episode_divider
 *  - Sticky prev/next nav
 */
export default async function EpisodeReaderPage({ params }: Props) {
  const { uid } = await params;
  const client = createClient();
  const ep = await client.getByUID("episode", uid).catch(() => null);
  if (!ep) notFound();

  // Prev / next for chapter navigation (ascending order → prev is lower number)
  const allEpisodes = await client.getAllByType("episode", {
    orderings: [{ field: "my.episode.chapter_number", direction: "asc" }],
  });
  const idx = allEpisodes.findIndex((e) => e.id === ep.id);
  const prev = idx > 0 ? allEpisodes[idx - 1] : null;
  const next = idx < allEpisodes.length - 1 ? allEpisodes[idx + 1] : null;

  return (
    <article className="hotc-ereader hotc--cinema">
      {/* Episode header — replicates EpisodeReader.__head */}
      <div className="hotc-ereader__head">
        <Link href="/episodes" className="hotc-ereader__back">
          ← Archive
        </Link>
        <span className="hotc-ereader__chapter">
          Chapter {ep.data.chapter_number ?? "—"}
        </span>
        <h1 className="hotc-ereader__title">{ep.data.title}</h1>
        <p className="hotc-ereader__date">
          {ep.data.publish_date ?? ""}
          {ep.data.summary
            ? ` · ${asText(ep.data.summary).slice(0, 80)}`
            : ""}
        </p>
      </div>

      {/* Comic strip — SliceZone renders panels, beats, dividers */}
      <div className="hotc-ereader__strip">
        <SliceZone slices={ep.data.slices} components={components} />
      </div>

      {/* Sticky prev/next nav — replicates EpisodeReader.__nav */}
      <nav className="hotc-ereader__nav">
        <div className="hotc-ereader__nav-inner">
          {prev ? (
            <Link href={`/episodes/${prev.uid}`} className="hotc-btn hotc-btn--ghost">
              ← Prev
            </Link>
          ) : (
            <button className="hotc-btn hotc-btn--ghost" disabled>
              ← Prev
            </button>
          )}

          <div className="hotc-ereader__progress">
            <span className="hotc-attr-label">CH. {ep.data.chapter_number}</span>
          </div>

          {next ? (
            <Link href={`/episodes/${next.uid}`} className="hotc-btn hotc-btn--ember">
              Next →
            </Link>
          ) : (
            <button className="hotc-btn hotc-btn--ember" disabled>
              Next →
            </button>
          )}
        </div>
      </nav>
    </article>
  );
}
