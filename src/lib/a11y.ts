const GENERIC_CTA_LABELS = new Set([
  "learn more",
  "read more",
  "discover",
  "explore",
  "view",
  "view more",
  "more",
]);

function normalizeLabel(value: string) {
  return value.trim().toLowerCase().replace(/[.!?:]+$/g, "");
}

function getLocaleFromHref(href: string) {
  return href.startsWith("/es") ? "es" : "en";
}

export function getDescriptiveCtaLabel(
  label: string | null | undefined,
  href: string | null | undefined,
) {
  if (!label || !href || !GENERIC_CTA_LABELS.has(normalizeLabel(label))) {
    return label;
  }

  const locale = getLocaleFromHref(href);
  if (/\/characters(?:[/?#]|$)/.test(href)) {
    return locale === "es" ? "Explora los personajes" : "Explore the characters";
  }

  if (/\/lore(?:[/?#]|$)/.test(href)) {
    return locale === "es" ? "Descubre el lore" : "Discover the lore";
  }

  return label;
}

export function getContextualCtaAriaLabel(
  label: string | null | undefined,
  context: string | null | undefined,
) {
  if (!label || !context) {
    return undefined;
  }

  const normalizedLabel = normalizeLabel(label);
  const normalizedContext = context.trim();

  if (!normalizedContext || !GENERIC_CTA_LABELS.has(normalizedLabel)) {
    return undefined;
  }

  return `${label.trim()} about ${normalizedContext}`;
}
