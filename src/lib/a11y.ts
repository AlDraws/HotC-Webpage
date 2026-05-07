import { getUiCopy, type UiCopy } from "@/lib/ui-copy";

function normalizeLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[.!?:]+$/g, "");
}

function getLocaleFromHref(href: string) {
  return href.startsWith("/es") ? "es" : "en";
}

function getGenericCtaLabels(copy: UiCopy) {
  return new Set(Object.values(copy.a11y.genericCtas).map(normalizeLabel));
}

export function getDescriptiveCtaLabel(
  label: string | null | undefined,
  href: string | null | undefined,
) {
  if (!label || !href) {
    return label;
  }

  const locale = getLocaleFromHref(href);
  const copy = getUiCopy(locale);
  if (!getGenericCtaLabels(copy).has(normalizeLabel(label))) {
    return label;
  }

  if (/\/characters(?:[/?#]|$)/.test(href)) {
    return copy.a11y.descriptiveCtas.characters;
  }

  if (/\/lore(?:[/?#]|$)/.test(href)) {
    return copy.a11y.descriptiveCtas.lore;
  }

  return label;
}

export function getContextualCtaAriaLabel(
  label: string | null | undefined,
  context: string | null | undefined,
  locale: "en" | "es" = "en",
) {
  if (!label || !context) {
    return undefined;
  }

  const normalizedLabel = normalizeLabel(label);
  const normalizedContext = context.trim();
  const copy = getUiCopy(locale);

  if (!normalizedContext || !getGenericCtaLabels(copy).has(normalizedLabel)) {
    return undefined;
  }

  return `${label.trim()} ${copy.a11y.aboutConnector} ${normalizedContext}`;
}
