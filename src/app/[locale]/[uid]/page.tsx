import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { createClient, SLICE_FETCH_LINKS } from "@/prismicio";
import { asText } from "@prismicio/client";
import { components } from "@/slices";
import { normalizeSlices } from "@/lib/prismic-slices";
import { toPrismicLang, type AppLocale } from "@/lib/locale";

type Params = { locale: AppLocale; uid: string };
const RESERVED_PAGE_UIDS = new Set([
  "home",
  "characters",
  "episode_index",
  "episodes",
  "lore",
  "store",
]);

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, uid } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const page = await client
    .getByUID("page", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);
  if (!page) return {};
  return {
    title: page.data.meta_title || asText(page.data.title),
    description: page.data.meta_description || undefined,
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("page");
  return pages
    .filter((p) => !RESERVED_PAGE_UIDS.has(p.uid))
    .map((p) => ({ uid: p.uid }));
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
  const { locale, uid } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const page = await client
    .getByUID("page", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);
  if (!page) notFound();

  return <SliceZone slices={normalizeSlices(page.data.slices)} components={components} />;
}
