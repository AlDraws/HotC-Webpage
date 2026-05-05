import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { asText } from "@prismicio/client";
import { components } from "@/slices";

type Params = { uid: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const page = await client.getByUID("page", uid).catch(() => null);
  if (!page) return {};
  return {
    title: page.data.meta_title || asText(page.data.title),
    description: page.data.meta_description || undefined,
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("page");
  return pages.filter((p) => p.uid !== "home").map((p) => ({ uid: p.uid }));
}

/**
 * Catch-all page — renders any Prismic "page" document by UID
 * (about, contact, etc.) using the SliceZone.
 */
export default async function GenericPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;
  const client = createClient();
  const page = await client.getByUID("page", uid).catch(() => null);
  if (!page) notFound();

  return <SliceZone slices={page.data.slices} components={components} />;
}
