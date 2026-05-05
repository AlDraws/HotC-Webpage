import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import Link from "next/link";
import { createClient } from "@/prismicio";

type Props = { params: Promise<{ uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const ep = await client.getByUID("episode", uid).catch(() => null);
  if (!ep) return {};
  return {
    title: ep.data.meta_title ?? `Chapter ${ep.data.number}`,
    description: ep.data.meta_description ?? undefined,
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const episodes = await client.getAllByType("episode");
  return episodes.map((ep) => ({ uid: ep.uid }));
}

/**
 * Episode reader — webtoon-style vertical scroll.
 *
 * Each "page" in Prismic is a 1080×~13000 px strip.
 * We render them as full-width images stacked vertically
 * inside a max-width container matching the comic's native width.
 */
export default async function EpisodeReaderPage({ params }: Props) {
  const { uid } = await params;
  const client = createClient();
  const ep = await client.getByUID("episode", uid).catch(() => null);
  if (!ep) notFound();

  // Fetch prev/next for navigation
  const allEpisodes = await client.getAllByType("episode", {
    orderings: [{ field: "my.episode.number", direction: "asc" }],
  });
  const idx = allEpisodes.findIndex((e) => e.id === ep.id);
  const prev = idx > 0 ? allEpisodes[idx - 1] : null;
  const next = idx < allEpisodes.length - 1 ? allEpisodes[idx + 1] : null;

  const pages = ep.data.pages ?? [];

  return (
    <article className="bg-slate-950">
      {/* Episode header */}
      <div className="mx-auto max-w-3xl px-6 pb-8 pt-12 text-center">
        <p className="kicker mb-2">Chapter {ep.data.number ?? "—"}</p>
        <PrismicRichText
          field={ep.data.title}
          components={{
            heading1: ({ children }) => (
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                {children}
              </h1>
            ),
          }}
        />
        {ep.data.synopsis ? (
          <div className="mx-auto mt-4 max-w-xl text-on-ink-mute">
            <PrismicRichText field={ep.data.synopsis} />
          </div>
        ) : null}
      </div>

      {/* Comic strips — stacked vertically, no gaps (seamless scroll) */}
      <div
        className="mx-auto"
        style={{ maxWidth: "var(--hotc-reader-max, 1080px)" }}
      >
        {pages.map((page, i) =>
          page.image?.url ? (
            <PrismicNextImage
              key={i}
              field={page.image}
              quality={100}
              className="block w-full"
              // No fill — we want natural aspect ratio so the strip
              // renders at full height without cropping.
              sizes="(min-width: 1080px) 1080px, 100vw"
              alt={page.alt ?? ""}
            />
          ) : null,
        )}
      </div>

      {/* Prev / Next navigation */}
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-12">
        {prev ? (
          <Link
            href={`/episodes/${prev.uid}`}
            className="flex items-center gap-2 text-sm font-medium text-on-ink-mute transition-colors hover:text-ember"
          >
            <span aria-hidden>&larr;</span>
            <span>Previous</span>
          </Link>
        ) : (
          <span />
        )}
        <Link
          href="/episodes"
          className="text-sm font-medium text-on-ink-mute transition-colors hover:text-ember"
        >
          All episodes
        </Link>
        {next ? (
          <Link
            href={`/episodes/${next.uid}`}
            className="flex items-center gap-2 text-sm font-medium text-on-ink-mute transition-colors hover:text-ember"
          >
            <span>Next</span>
            <span aria-hidden>&rarr;</span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
