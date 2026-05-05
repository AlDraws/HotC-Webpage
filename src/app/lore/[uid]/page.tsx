import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import { asText } from "@prismicio/client";
import { components } from "@/slices";
import Link from "next/link";
import { createClient } from "@/prismicio";

type Props = { params: Promise<{ uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const item = await client.getByUID("lore_entry", uid).catch(() => null);
  if (!item) return {};
  return { title: item.data.title ?? uid };
}

export async function generateStaticParams() {
  const client = createClient();
  const items = await client.getAllByType("lore_entry");
  return items.map((i) => ({ uid: i.uid }));
}

export default async function LoreDetailPage({ params }: Props) {
  const { uid } = await params;
  const client = createClient();
  const item = await client.getByUID("lore_entry", uid).catch(() => null);
  if (!item) notFound();

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
          {item.data.category ? <p className="kicker mb-2">{item.data.category}</p> : null}
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">{item.data.title}</h1>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <SliceZone slices={item.data.slices} components={components} />

        <div className="mt-12">
          <Link href="/lore" className="text-sm font-medium text-on-ink-mute transition-colors hover:text-ember">
            &larr; All lore
          </Link>
        </div>
      </div>
    </article>
  );
}
