import type { AppLocale } from "@/lib/locale";

const DATE_LOCALE_MAP: Record<AppLocale, string> = {
  en: "en-US",
  es: "es-ES",
};

export function formatDate(
  date: string | null | undefined,
  locale: AppLocale,
): string {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(DATE_LOCALE_MAP[locale], {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(date));
  } catch {
    return date;
  }
}
