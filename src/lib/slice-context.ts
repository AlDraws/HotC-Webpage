import type { AppLocale } from "@/lib/locale";

export type HotcSliceContext = {
  locale?: AppLocale;
};

export function getSliceLocale(context: HotcSliceContext | null | undefined): AppLocale {
  return context?.locale === "es" ? "es" : "en";
}
