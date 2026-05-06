export function getLinkHref(linkField: unknown): string | null {
  if (
    linkField &&
    typeof linkField === "object" &&
    "url" in linkField &&
    typeof (linkField as { url?: unknown }).url === "string" &&
    (linkField as { url: string }).url
  ) {
    return (linkField as { url: string }).url.trim();
  }

  return null;
}

export function getLinkTarget(linkField: unknown): string | undefined {
  if (
    linkField &&
    typeof linkField === "object" &&
    "target" in linkField &&
    typeof (linkField as { target?: unknown }).target === "string" &&
    (linkField as { target: string }).target
  ) {
    return (linkField as { target: string }).target;
  }

  return undefined;
}

export function normalizeHref(rawHref: string): string {
  const value = rawHref.trim();
  if (!value) return value;

  if (/^(mailto:|tel:|sms:)/i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/") || value.startsWith("#")) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;

  return `https://${value.replace(/^\/+/, "")}`;
}

export function resolveLinkHref(linkField: unknown): string | null {
  const href = getLinkHref(linkField);
  return href ? normalizeHref(href) : null;
}

export function isExternalHref(href: string): boolean {
  const value = href.trim();
  if (!value || value.startsWith("/") || value.startsWith("#")) return false;
  if (value.startsWith("//")) return true;
  if (/^(mailto:|tel:|sms:)/i.test(value)) return true;

  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}
