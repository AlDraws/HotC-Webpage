import { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { asText } from "@prismicio/client";
import { createClient, SLICE_FETCH_LINKS } from "@/prismicio";
import { components } from "@/slices";
import { normalizeSlices } from "@/lib/prismic-slices";
import { toPrismicLang, type AppLocale } from "@/lib/locale";

type Props = { params: Promise<{ locale: AppLocale }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const page = await client
    .getSingle("home", { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);

  if (!page) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Home page content not found. Please create it in Prismic.</p>
      </div>
    );
  }

  return <SliceZone slices={normalizeSlices(page.data.slices)} components={components} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const page = await client
    .getSingle("home", { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);

  if (!page) return {};

  return {
    title: {
      absolute: "Heirs of the Collapse",
    },
    description: page.data.meta_description
      ? asText(page.data.meta_description)
      : undefined,
  };
}
