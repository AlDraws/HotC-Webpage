import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, normalizeAppLocale, toPrismicLang } from "@/lib/locale";
import type { AppLocale, PrismicLang } from "@/lib/locale";

export async function getRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  return normalizeAppLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export async function getRequestPrismicLang(): Promise<PrismicLang> {
  const locale = await getRequestLocale();
  return toPrismicLang(locale);
}
