import { Metadata } from "next";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import Link from "next/link";
import { createClient } from "@/prismicio";

export const metadata: Metadata = { title: "Episodes" };

export default async function EpisodesPage() {
  const client = createClient();
  const episodes = await client.getAllByType("episode", {
    orderings: [{ field: "my.episode.chapter_number", direction: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-2 font-display text-5xl uppercase tracking-wide md:text-7xl">
        Episodes
      </h1>
      <p className="mb-12 text-on-ink-mute">
        Read the story from the beginning, or jump to the latest chapter.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {episodes.map((ep) => (
          <Link
            key={ep.id}
            href={`/episodes/${ep.uid}`}
            className="group relative overflow-hidden rounded-sm border-2 border-ink bg-slate-900 transition-transform hover:-translate-y-1"
            style={{ boxShadow: "var(--hotc-shadow-panel-sm)" }}
          >
              {/* Cover */}
            <div className="relative aspect-[4/5] overflow-hidden">
              {ep.data.cover?.url ? (
                <PrismicNextImage
                  field={ep.data.cover}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-800 text-on-ink-faint">
                  No cover
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-on-ink-faint">
                Chapter {ep.data.chapter_number ?? "—"}
              </p>
              <h2 className="text-lg font-bold leading-tight tracking-tight">
                {ep.data.title}
              </h2>
              {ep.data.summary ? (
                <div className="mt-2 line-clamp-2 text-sm text-on-ink-mute">
                  <PrismicRichText field={ep.data.summary} />
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
