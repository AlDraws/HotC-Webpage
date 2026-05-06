export const LOCALE_COOKIE_NAME = "hotc-locale";

export const PRISMIC_LANG_BY_LOCALE = {
  en: "en-us",
  es: "es-es",
} as const;

export type AppLocale = keyof typeof PRISMIC_LANG_BY_LOCALE;
export type PrismicLang = (typeof PRISMIC_LANG_BY_LOCALE)[AppLocale];
export const SUPPORTED_LOCALES = Object.keys(
  PRISMIC_LANG_BY_LOCALE,
) as AppLocale[];
export const DEFAULT_LOCALE: AppLocale = "en";

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && value in PRISMIC_LANG_BY_LOCALE);
}

export function normalizeAppLocale(value: string | null | undefined): AppLocale {
  if (!value) return DEFAULT_LOCALE;
  const normalized = value.toLowerCase();
  return normalized.startsWith("es") ? "es" : "en";
}

export function toPrismicLang(locale: AppLocale): PrismicLang {
  return PRISMIC_LANG_BY_LOCALE[locale];
}
