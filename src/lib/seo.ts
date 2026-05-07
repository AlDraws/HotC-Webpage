import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  normalizeAppLocale,
  type AppLocale,
} from "@/lib/locale";

type LocalizedRouteDocument = {
  type: string;
  uid?: string | null;
  lang: string;
  alternate_languages?: Array<{
    type: string;
    uid?: string | null;
    lang: string;
  }>;
};

type MetadataInput = {
  locale: AppLocale;
  title: string;
  absoluteTitle?: boolean;
  description?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  pathname?: string;
  document?: LocalizedRouteDocument | null;
  type?: "website" | "article";
};

const SITE_NAME = "Heirs of the Collapse";
const OG_LOCALE_BY_APP_LOCALE: Record<AppLocale, string> = {
  en: "en_US",
  es: "es_ES",
};

function normalizeOrigin(value: string) {
  if (!value) {
    return "http://localhost:3000";
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") {
    return "";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function ensureAbsoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return new URL(value.startsWith("/") ? value : `/${value}`, metadataBase).toString();
}

function resolveLocalizedStaticPath(locale: AppLocale, pathname = "/") {
  const normalizedPathname = normalizePathname(pathname);
  return normalizedPathname ? `/${locale}${normalizedPathname}` : `/${locale}`;
}

function resolvePrismicDocumentPath(
  doc: Pick<LocalizedRouteDocument, "type" | "uid">,
  locale: AppLocale,
) {
  switch (doc.type) {
    case "home":
      return `/${locale}`;
    case "page":
      if (!doc.uid || doc.uid === "home") {
        return `/${locale}`;
      }
      if (doc.uid === "stores") {
        return `/${locale}/store`;
      }
      return `/${locale}/${doc.uid}`;
    case "episodes_index":
      return `/${locale}/episodes`;
    case "episode":
      return doc.uid ? `/${locale}/episodes/${doc.uid}` : null;
    case "lore_entry":
      return doc.uid ? `/${locale}/lore/${doc.uid}` : null;
    case "character":
      return doc.uid ? `/${locale}/characters/${doc.uid}` : null;
    default:
      return null;
  }
}

function buildAlternatesFromPaths(
  currentPath: string,
  languagePaths: Partial<Record<AppLocale, string>>,
): NonNullable<Metadata["alternates"]> {
  const defaultPath = languagePaths[DEFAULT_LOCALE] ?? currentPath;
  const languages = Object.fromEntries(
    Object.entries(languagePaths).map(([locale, path]) => [
      locale,
      ensureAbsoluteUrl(path),
    ]),
  ) as Record<string, string>;

  languages["x-default"] = ensureAbsoluteUrl(defaultPath);

  return {
    canonical: ensureAbsoluteUrl(currentPath),
    languages,
  };
}

export const metadataBase = new URL(
  normalizeOrigin(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL ||
      "",
  ),
);

export function buildStaticAlternates(locale: AppLocale, pathname = "/") {
  const currentPath = resolveLocalizedStaticPath(locale, pathname);
  const languagePaths = Object.fromEntries(
    SUPPORTED_LOCALES.map((supportedLocale) => [
      supportedLocale,
      resolveLocalizedStaticPath(supportedLocale, pathname),
    ]),
  ) as Record<AppLocale, string>;

  return buildAlternatesFromPaths(currentPath, languagePaths);
}

export function buildDocumentAlternates(
  locale: AppLocale,
  document: LocalizedRouteDocument,
) {
  const currentPath =
    resolvePrismicDocumentPath(document, locale) ??
    resolveLocalizedStaticPath(locale, "/");
  const languagePaths: Partial<Record<AppLocale, string>> = {
    [locale]: currentPath,
  };

  for (const alternate of document.alternate_languages ?? []) {
    const alternateLocale = normalizeAppLocale(alternate.lang);
    const alternatePath = resolvePrismicDocumentPath(alternate, alternateLocale);
    if (alternatePath) {
      languagePaths[alternateLocale] = alternatePath;
    }
  }

  return buildAlternatesFromPaths(currentPath, languagePaths);
}

export function buildPageMetadata({
  locale,
  title,
  absoluteTitle = false,
  description,
  imageUrl,
  imageAlt,
  pathname = "/",
  document,
  type = "website",
}: MetadataInput): Metadata {
  const alternates = document
    ? buildDocumentAlternates(locale, document)
    : buildStaticAlternates(locale, pathname);
  const canonicalUrl =
    typeof alternates.canonical === "string" || alternates.canonical instanceof URL
      ? alternates.canonical
      : alternates.canonical?.url || ensureAbsoluteUrl(resolveLocalizedStaticPath(locale, pathname));
  const socialImage = imageUrl ? ensureAbsoluteUrl(imageUrl) : undefined;
  const socialImageAlt = imageAlt?.trim() || title;

  return {
    metadataBase,
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates,
    openGraph: {
      type,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALE_BY_APP_LOCALE[locale],
      title,
      description,
      images: socialImage
        ? [
            {
              url: socialImage,
              alt: socialImageAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title,
      description,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export { SITE_NAME };
