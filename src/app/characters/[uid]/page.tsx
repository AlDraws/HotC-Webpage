import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";
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
    .getByUID<Content.CharacterDocument>("character", uid)
    .catch(() => notFound());

  return {
    title: page.data.meta_title || page.data.name || undefined,
    description: asText(page.data.meta_description) || undefined,
    openGraph: {
      title: page.data.meta_title || page.data.name || undefined,
      images: page.data.meta_image?.url ? [{ url: page.data.meta_image.url }] : undefined,
    },
  };
}

export default async function CharacterPage({ params }: { params: Promise<Params> }) {
  const { uid } = await params;
  const client = createClient();
  const page = await client
    .getByUID<Content.CharacterDocument>("character", uid)
    .catch(() => notFound());

  return (
    <>
      <Bounded yPadding="sm">
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
          <div className="md:col-span-1">
            {page.data.portrait?.url ? (
              <div className="overflow-hidden rounded-md">
                <PrismicNextImage field={page.data.portrait} className="w-full h-auto" fallbackAlt="" />
              </div>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <Heading as="h1">{page.data.name}</Heading>
            {page.data.role ? (
              <p className="mt-2 text-sm uppercase tracking-wide text-slate-500">{page.data.role}</p>
            ) : null}
            {page.data.short_bio?.length ? (
              <div className="mt-6 text-slate-700">
                <PrismicRichText field={page.data.short_bio} />
              </div>
            ) : null}
          </div>
        </div>
      </Bounded>

      {page.data.gallery?.length ? (
        <Bounded yPadding="sm">
          <Heading as="h2" size="md" className="mb-6">Gallery</Heading>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {page.data.gallery.map((item, idx) => (
              <div key={idx} className="overflow-hidden rounded-md">
                {item.image?.url ? (
                  <PrismicNextImage field={item.image} className="w-full h-auto" fallbackAlt="" />
                ) : null}
                {item.caption ? (
                  <p className="mt-2 text-sm text-slate-500">{item.caption}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Bounded>
      ) : null}
    </>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("character");
  return pages.map((doc) => ({ uid: doc.uid! }));
}
