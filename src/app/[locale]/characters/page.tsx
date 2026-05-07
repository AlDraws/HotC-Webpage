import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { createClient, SLICE_FETCH_LINKS } from "@/prismicio";
import { isDocumentVisible } from "@/lib/content-visibility";
import { normalizeSlices } from "@/lib/prismic-slices";
import { toPrismicLang, type AppLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/seo";
import { components } from "@/slices";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    pathname: "/characters",
    title: "Characters",
    description: "Meet the cast of Heirs of the Collapse.",
  });
}

export default async function CharactersPage({ params }: Props) {
  const { locale } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const charactersPage = await client
    .getByUID("page", "characters", { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);
  if (charactersPage && !isDocumentVisible(charactersPage)) notFound();

  return (
    <SliceZone
      slices={normalizeSlices(charactersPage?.data.slices)}
      components={components}
    />
  );
}
