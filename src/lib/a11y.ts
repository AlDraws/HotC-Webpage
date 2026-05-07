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
