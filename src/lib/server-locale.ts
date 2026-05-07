import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Content } from "@prismicio/client";
import { createClient } from "@/prismicio";
import { DEFAULT_LOCALE, toPrismicLang, type AppLocale } from "@/lib/locale";

const PRISMIC_CHROME_REVALIDATE_SECONDS =
  process.env.NODE_ENV === "production" ? 3600 : 5;

function hasUsableLink(linkField: unknown): boolean {
  if (!linkField || typeof linkField !== "object") return false;
  if (
    "link_type" in linkField &&
    (linkField as { link_type?: unknown }).link_type === "Any"
  ) {
    return false;
  }

  return (
    ("url" in linkField && Boolean((linkField as { url?: unknown }).url)) ||
    ("id" in linkField && Boolean((linkField as { id?: unknown }).id))
  );
}

async function fetchSettings(locale: AppLocale) {
  const client = createClient();
  return client
    .getSingle("settings", { lang: toPrismicLang(locale) })
    .catch(() => null);
}

async function fetchNavigation(locale: AppLocale) {
  const client = createClient();
  return client
    .getSingle("navigation", { lang: toPrismicLang(locale) })
    .catch(() => null);
}

const getCachedSettings = unstable_cache(
  fetchSettings,
  ["prismic-settings-by-locale"],
  {
    tags: ["prismic"],
    revalidate: PRISMIC_CHROME_REVALIDATE_SECONDS,
  },
);

const getCachedNavigation = unstable_cache(
  fetchNavigation,
  ["prismic-navigation-by-locale"],
  {
    tags: ["prismic"],
    revalidate: PRISMIC_CHROME_REVALIDATE_SECONDS,
  },
);

function mergeNavigationLinks(
  localized: Content.NavigationDocument | null,
  fallback: Content.NavigationDocument | null,
): Content.NavigationDocument | null {
  if (!localized) return fallback;
  if (!fallback) return localized;

  return {
    ...localized,
    data: {
      ...localized.data,
      primary_links: (localized.data.primary_links ?? []).map((item, index) => ({
        ...item,
        link: hasUsableLink(item.link)
          ? item.link
          : (fallback.data.primary_links ?? [])[index]?.link ?? item.link,
      })),
    },
  } as Content.NavigationDocument;
}

export const getSettings = cache(async (locale: AppLocale) => {
  return getCachedSettings(locale);
});

export const getNavigation = cache(async (locale: AppLocale) => {
  const localized = await getCachedNavigation(locale);

  if (locale === DEFAULT_LOCALE) {
    return localized;
  }

  const fallback = await getCachedNavigation(DEFAULT_LOCALE);
  return mergeNavigationLinks(localized, fallback);
});
