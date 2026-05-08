import { MetadataRoute } from "next";
import { createClient } from "@/prismicio";
import { metadataBase } from "@/lib/seo";
import { SUPPORTED_LOCALES, toPrismicLang, type AppLocale } from "@/lib/locale";
import { filterVisibleDocuments } from "@/lib/content-visibility";

function url(path: string): string {
  return new URL(path, metadataBase).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = createClient();
  const entries: MetadataRoute.Sitemap = [];

  // Static routes per locale
  const staticPaths = ["", "/episodes", "/characters", "/lore", "/store"];
  for (const locale of SUPPORTED_LOCALES) {
    for (const path of staticPaths) {
      entries.push({ url: url(`/${locale}${path}`), alternates: { languages: Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, url(`/${l}${path}`)])) } });
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
      results.push({ url: url(`/${locale}/episodes/${ep.uid}`) });
    }
    for (const char of filterVisibleDocuments(characters)) {
      results.push({ url: url(`/${locale}/characters/${char.uid}`) });
    }
    for (const entry of filterVisibleDocuments(loreEntries)) {
      results.push({ url: url(`/${locale}/lore/${entry.uid}`) });
    }
    for (const page of filterVisibleDocuments(pages)) {
      if (page.uid && page.uid !== "home") {
        results.push({ url: url(`/${locale}/${page.uid}`) });
      }
    }

    return results;
  });

  const dynamicEntries = await Promise.all(fetches);
  for (const batch of dynamicEntries) {
    entries.push(...batch);
  }

  return entries;
}
