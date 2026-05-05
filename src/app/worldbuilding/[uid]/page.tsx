import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { PrismicRichText } from "@/components/PrismicRichText";

type Params = { uid: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const page = await client
    .getByUID<Content.LoreEntryDocument>("lore_entry", uid)
    .catch(() => notFound());

  return {
    title: page.data.meta_title || page.data.title || undefined,
    description: asText(page.data.meta_description) || undefined,
    openGraph: {
      title: page.data.meta_title || page.data.title || undefined,
      images: page.data.meta_image?.url ? [{ url: page.data.meta_image.url }] : undefined,
    },
  };
}

export default async function LoreEntryPage({ params }: { params: Promise<Params> }) {
  const { uid } = await params;
  const client = createClient();
  const page = await client
    .getByUID<Content.LoreEntryDocument>("lore_entry", uid)
    .catch(() => notFound());

  return (
    <>
      <Bounded yPadding="sm">
        <Heading as="h1">{page.data.title}</Heading>
        {page.data.cover?.url ? (
          <div className="mt-6 overflow-hidden rounded-md">
            <PrismicNextImage field={page.data.cover} className="h-auto w-full" fallbackAlt="" />
          </div>
        ) : null}
        {page.data.short_intro?.length ? (
          <div className="mt-6 text-slate-700">
            <PrismicRichText field={page.data.short_intro} />
          </div>
        ) : null}
      </Bounded>

      <SliceZone slices={page.data.slices} components={components} />
    </>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("lore_entry");
  return pages.map((doc) => ({ uid: doc.uid! }));
}
