import { MetadataRoute } from "next";
import { createClient } from "@/prismicio";
import { metadataBase } from "@/lib/seo";
import {
  isAppLocale,
  normalizeAppLocale,
  SUPPORTED_LOCALES,
  toPrismicLang,
  type AppLocale,
} from "@/lib/locale";
import { filterVisibleDocuments } from "@/lib/content-visibility";

function url(path: string): string {
  return new URL(path, metadataBase).toString();
}

type AlternateLang = { uid?: string | null; lang: string };

function buildDynamicAlternates(
  locale: AppLocale,
  currentUrl: string,
  alternateLangs: AlternateLang[],
  pathBuilder: (locale: AppLocale, uid: string) => string
): { languages: Record<string, string> } {
  const languages: Record<string, string> = { [locale]: currentUrl };
  for (const alt of alternateLangs) {
    if (!alt.uid) continue;
    const altLocale = normalizeAppLocale(alt.lang);
    if (isAppLocale(altLocale) && altLocale !== locale) {
      languages[altLocale] = url(pathBuilder(altLocale, alt.uid));
    }
  }
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = createClient();
  const entries: MetadataRoute.Sitemap = [];

  // Static routes per locale
  const staticPaths = ["", "/episodes", "/characters", "/lore", "/store"];
  for (const locale of SUPPORTED_LOCALES) {
    for (const path of staticPaths) {
      entries.push({
        url: url(`/${locale}${path}`),
        alternates: {
          languages: Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, url(`/${l}${path}`)])),
        },
      });
    }
  }

  // Dynamic routes — fetch all locales in parallel
  const fetches = SUPPORTED_LOCALES.map(async (locale: AppLocale) => {
    const lang = toPrismicLang(locale);

    const [episodes, characters, loreEntries, pages] = await Promise.all([
      client.getAllByType("episode", { lang }).catch(() => []),
      client.getAllByType("character", { lang }).catch(() => []),
      client.getAllByType("lore_entry", { lang }).catch(() => []),
      client.getAllByType("page", { lang }).catch(() => []),
    ]);

    const results: MetadataRoute.Sitemap = [];

    for (const ep of filterVisibleDocuments(episodes)) {
      const currentUrl = url(`/${locale}/episodes/${ep.uid}`);
      results.push({
        url: currentUrl,
        alternates: buildDynamicAlternates(
          locale,
          currentUrl,
          ep.alternate_languages ?? [],
          (l, uid) => `/${l}/episodes/${uid}`
        ),
      });
    }

    for (const char of filterVisibleDocuments(characters)) {
      const currentUrl = url(`/${locale}/characters/${char.uid}`);
      results.push({
        url: currentUrl,
        alternates: buildDynamicAlternates(
          locale,
          currentUrl,
          char.alternate_languages ?? [],
          (l, uid) => `/${l}/characters/${uid}`
        ),
      });
    }

    for (const entry of filterVisibleDocuments(loreEntries)) {
      const currentUrl = url(`/${locale}/lore/${entry.uid}`);
      results.push({
        url: currentUrl,
        alternates: buildDynamicAlternates(
          locale,
          currentUrl,
          entry.alternate_languages ?? [],
          (l, uid) => `/${l}/lore/${uid}`
        ),
      });
    }

    for (const page of filterVisibleDocuments(pages)) {
      if (!page.uid || page.uid === "home") continue;
      const currentUrl = url(`/${locale}/${page.uid}`);
      results.push({
        url: currentUrl,
        alternates: buildDynamicAlternates(
          locale,
          currentUrl,
          page.alternate_languages ?? [],
          (l, uid) => `/${l}/${uid}`
        ),
      });
    }

    return results;
  });

  const dynamicEntries = await Promise.all(fetches);
  for (const batch of dynamicEntries) {
    entries.push(...batch);
  }

  return entries;
}
