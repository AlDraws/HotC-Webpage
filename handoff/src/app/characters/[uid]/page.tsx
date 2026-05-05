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
  return { title: asText(ch.data.name) ?? uid };
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

  const attributes = ch.data.attributes ?? [];
  const gallery = ch.data.gallery ?? [];

  return (
    <article>
      {/* Hero with cover bg */}
      <div className="relative isolate overflow-hidden bg-slate-900">
        {ch.data.cover?.url ? (
          <div className="absolute inset-0 -z-10">
            <PrismicNextImage
              field={ch.data.cover}
              fill
              className="object-cover"
              sizes="100vw"
              quality={100}
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        ) : null}

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
            <PrismicRichText
              field={ch.data.name}
              components={{
                heading1: ({ children }) => (
                  <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                    {children}
                  </h1>
                ),
              }}
            />
            {ch.data.epithet ? (
              <div className="mt-3 text-lg text-on-ink-mute">
                <PrismicRichText field={ch.data.epithet} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Attributes grid */}
        {attributes.length > 0 ? (
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {attributes.map((attr, i) => (
              <div key={i} className="rounded-sm bg-slate-800/60 p-3">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-ink-faint">
                  {attr.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{attr.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Bio */}
        {ch.data.bio ? (
          <div className="prose prose-invert max-w-none text-on-ink-mute">
            <PrismicRichText field={ch.data.bio} />
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
