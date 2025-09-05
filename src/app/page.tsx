import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";

async function getHomepageDoc(client: ReturnType<typeof createClient>) {
  const home = await client.getSingle<Content.HomeDocument>("home").catch(() => null);
  if (home) return home;
  const pageHome = await client.getByUID<Content.PageDocument>("page", "home").catch(() => null);
  return pageHome;
}

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const doc = await getHomepageDoc(client);
  if (!doc) notFound();

  const title = doc.type === "page"
    ? doc.data.meta_title || asText((doc as Content.PageDocument).data.title) || undefined
    : (doc as Content.HomeDocument).data.meta_title || (doc as Content.HomeDocument).data.title || undefined;

  const description = doc.type === "page"
    ? (doc as Content.PageDocument).data.meta_description || undefined
    : asText((doc as Content.HomeDocument).data.meta_description) || undefined;

  const metaImage = (doc.data as any)?.meta_image?.url;

  return {
    title,
    description,
    openGraph: {
      title: title || undefined,
      images: metaImage ? [{ url: metaImage }] : undefined,
    },
  };
}

export default async function Page() {
  const client = createClient();
  const doc = await getHomepageDoc(client);
  if (!doc) notFound();

  return <SliceZone slices={doc.data.slices} components={components} />;
}
