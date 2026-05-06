export const LOCALE_COOKIE_NAME = "hotc-locale";

export const PRISMIC_LANG_BY_LOCALE = {
  en: "en-us",
  es: "es-es",
} as const;

export type AppLocale = keyof typeof PRISMIC_LANG_BY_LOCALE;
export type PrismicLang = (typeof PRISMIC_LANG_BY_LOCALE)[AppLocale];

export function normalizeAppLocale(value: string | null | undefined): AppLocale {
  if (!value) return "en";
  const normalized = value.toLowerCase();
  return normalized.startsWith("es") ? "es" : "en";
}

export function toPrismicLang(locale: AppLocale): PrismicLang {
  return PRISMIC_LANG_BY_LOCALE[locale];
}
