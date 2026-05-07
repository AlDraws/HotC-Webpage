import { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { createClient, SLICE_FETCH_LINKS } from "@/prismicio";
import { components } from "@/slices";
import { normalizeSlices } from "@/lib/prismic-slices";
import { toPrismicLang, type AppLocale } from "@/lib/locale";
import {
  buildPageMetadata,
  getDefaultSiteDescription,
  getMetaDescriptionText,
  SITE_NAME,
} from "@/lib/seo";
import { getSettings } from "@/lib/server-locale";
import { getUiCopy } from "@/lib/ui-copy";

type Props = { params: Promise<{ locale: AppLocale }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const copy = getUiCopy(locale);
  const lang = toPrismicLang(locale);
  const client = createClient();
  const page = await client
    .getSingle("home", { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);

  if (!page) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>{copy.errors.homePageNotFound}</p>
      </div>
    );
  }

  return (
    <SliceZone
      slices={normalizeSlices(page.data.slices)}
      components={components}
      context={{ locale }}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const [page, settings] = await Promise.all([
    client
    .getSingle("home", { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null),
    getSettings(locale),
  ]);

  if (!page) return {};

  const description = getMetaDescriptionText(
    page.data.meta_description,
    getDefaultSiteDescription(locale),
  );
  const socialImage =
    page.data.meta_image?.url ||
    settings?.data.og_default?.url ||
    settings?.data.meta_image?.url ||
    undefined;

  return buildPageMetadata({
    locale,
    pathname: "/",
    document: page,
    title: SITE_NAME,
    absoluteTitle: true,
    description,
    imageUrl: socialImage,
    imageAlt: page.data.meta_image?.alt || SITE_NAME,
  });
}
