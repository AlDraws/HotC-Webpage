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
  const item = await client.getByUID("lore_item", uid).catch(() => null);
  if (!item) return {};
  return { title: asText(item.data.name) ?? uid };
}

export async function generateStaticParams() {
  const client = createClient();
  const items = await client.getAllByType("lore_item");
  return items.map((i) => ({ uid: i.uid }));
}

export default async function LoreDetailPage({ params }: Props) {
  const { uid } = await params;
  const client = createClient();
  const item = await client.getByUID("lore_item", uid).catch(() => null);
  if (!item) notFound();

  const gallery = item.data.gallery ?? [];

  return (
    <article>
      {/* Hero */}
      <div className="relative isolate overflow-hidden bg-slate-900">
        {item.data.cover?.url ? (
          <div className="absolute inset-0 -z-10">
            <PrismicNextImage field={item.data.cover} fill className="object-cover" sizes="100vw" quality={100} />
            <div className="absolute inset-0 bg-black/55" />
          </div>
        ) : null}
        <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
          {item.data.role ? <p className="kicker mb-2">{item.data.role}</p> : null}
          <PrismicRichText
            field={item.data.name}
            components={{
              heading1: ({ children }) => (
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">{children}</h1>
              ),
            }}
          />
          {item.data.epithet ? (
            <div className="mx-auto mt-4 max-w-xl text-lg text-on-ink-mute">
              <PrismicRichText field={item.data.epithet} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        {item.data.body ? (
          <div className="prose prose-invert max-w-none text-on-ink-mute">
            <PrismicRichText field={item.data.body} />
          </div>
        ) : null}

        {gallery.length > 0 ? (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Gallery</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((g, i) =>
                g.image?.url ? (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-sm bg-slate-800">
                    <PrismicNextImage field={g.image} fill className="object-cover" sizes="(min-width: 768px) 33vw, 50vw" />
                  </div>
                ) : null,
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-12">
          <Link href="/lore" className="text-sm font-medium text-on-ink-mute transition-colors hover:text-ember">
            &larr; All lore
          </Link>
        </div>
      </div>
    </article>
  );
}
