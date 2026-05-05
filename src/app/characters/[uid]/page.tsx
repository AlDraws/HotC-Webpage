import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { asText } from "@prismicio/client";
import Link from "next/link";
import { createClient } from "@/prismicio";

type Props = { params: Promise<{ uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const ch = await client.getByUID("character", uid).catch(() => null);
  if (!ch) return {};
  return { title: ch.data.name ?? uid };
}

export async function generateStaticParams() {
  const client = createClient();
  const chars = await client.getAllByType("character");
  return chars.map((ch) => ({ uid: ch.uid }));
}

export default async function CharacterProfilePage({ params }: Props) {
  const { uid } = await params;
  const client = createClient();
  const ch = await client.getByUID("character", uid).catch(() => null);
  if (!ch) notFound();

  const gallery = ch.data.gallery ?? [];

  return (
    <article>
      {/* Hero with cover bg */}
      <div className="relative isolate overflow-hidden bg-slate-900">


        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-16 md:flex-row md:items-end md:py-24">
          {/* Portrait */}
          {ch.data.portrait?.url ? (
            <div className="relative h-72 w-56 shrink-0 overflow-hidden rounded-sm border-2 border-ink md:h-96 md:w-72"
              style={{ boxShadow: "var(--hotc-shadow-panel)" }}>
              <PrismicNextImage
                field={ch.data.portrait}
                fill
                className="object-cover"
                quality={100}
              />
            </div>
          ) : null}

          {/* Name + epithet */}
          <div className="text-center md:text-left">
            {ch.data.role ? (
              <p className="kicker mb-2">{ch.data.role}</p>
            ) : null}
            {ch.data.name ? (
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                {ch.data.name}
              </h1>
            ) : null}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Bio */}
        {ch.data.short_bio ? (
          <div className="prose prose-invert max-w-none text-on-ink-mute">
            <PrismicRichText field={ch.data.short_bio} />
          </div>
        ) : null}

        {/* Gallery */}
        {gallery.length > 0 ? (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Gallery</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((g, i) =>
                g.image?.url ? (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-sm bg-slate-800">
                    <PrismicNextImage
                      field={g.image}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 33vw, 50vw"
                    />
                  </div>
                ) : null,
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-12">
          <Link href="/characters" className="text-sm font-medium text-on-ink-mute transition-colors hover:text-ember">
            &larr; All characters
          </Link>
        </div>
      </div>
    </article>
  );
}
