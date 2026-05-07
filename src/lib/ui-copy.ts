import en from "@/locales/ui/en.json";
import es from "@/locales/ui/es.json";
import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from "@/lib/locale";

const UI_COPY_BY_LOCALE = {
  en,
  es,
} as const;

export type UiCopy = (typeof UI_COPY_BY_LOCALE)[AppLocale];

export function getUiCopy(locale: AppLocale): UiCopy {
  return UI_COPY_BY_LOCALE[locale];
}

export function getLocaleFromPathname(pathname: string | null | undefined): AppLocale {
  if (!pathname) {
    return DEFAULT_LOCALE;
  }

  const [, maybeLocale] = pathname.split("/", 3);
  return isAppLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

export function formatUiText(
  template: string,
  values: Record<string, string | number | null | undefined>,
) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = values[key];
    return value === null || value === undefined ? "" : String(value);
  });
}

export function getLocalizedCharacterRole(role: string | null | undefined, locale: AppLocale) {
  if (!role) {
    return role ?? "";
  }

  const roles = getUiCopy(locale).character.roles as Record<string, string>;
  return roles[role] || role;
}

export function getLocalizedEpisodeArc(arc: string | null | undefined, locale: AppLocale) {
  if (!arc) {
    return arc ?? "";
  }

  const arcs = getUiCopy(locale).episodes.arcs as Record<string, string>;
  return arcs[arc] || arc;
}

export function getLocalizedLoreCategory(
  category: string | null | undefined,
  locale: AppLocale,
  form: "singular" | "plural" = "singular",
) {
  const copy = getUiCopy(locale).lore.categories as Record<
    string,
    { singular: string; plural: string; kicker: string }
  >;
  const fallback = copy.Other;
  const match = category ? copy[category] : null;
  return (match || fallback)[form];
}

export function getLocalizedLoreCategoryKicker(
  category: string | null | undefined,
  locale: AppLocale,
) {
  const copy = getUiCopy(locale).lore.categories as Record<
    string,
    { singular: string; plural: string; kicker: string }
  >;
  const fallback = copy.Other;
  const match = category ? copy[category] : null;
  return (match || fallback).kicker;
}
