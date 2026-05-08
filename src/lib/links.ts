import { isAppLocale, type AppLocale } from "@/lib/locale";

type DocumentLinkLike = {
  link_type?: unknown;
  type?: unknown;
  uid?: unknown;
};

type ResolveLinkOptions = {
  locale?: AppLocale;
  defaultExternalTarget?: string;
};

export type ResolvedLinkProps = {
  href: string;
  isExternal: boolean;
  target?: string;
  rel?: string;
};

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

function isDocumentLink(linkField: unknown): linkField is DocumentLinkLike {
  return (
    !!linkField &&
    typeof linkField === "object" &&
    "link_type" in linkField &&
    (linkField as { link_type?: unknown }).link_type === "Document"
  );
}

export function resolveAppLinkHref(linkField: unknown, locale?: AppLocale): string | null {
  if (!isDocumentLink(linkField)) {
    const href = resolveLinkHref(linkField);
    return href && locale ? localizeHref(href, locale) : href;
  }

  const type = typeof linkField.type === "string" ? linkField.type : null;
  const uid = typeof linkField.uid === "string" ? linkField.uid : null;

  if (locale) {
    switch (type) {
      case "home":
        return `/${locale}`;
      case "page":
        if (!uid || uid === "home") {
          return `/${locale}`;
        }
        return `/${locale}/${uid}`;
      case "episodes_index":
        return `/${locale}/episodes`;
      case "episode":
        return uid ? `/${locale}/episodes/${uid}` : null;
      case "lore_entry":
        return uid ? `/${locale}/lore/${uid}` : null;
      case "character":
        return uid ? `/${locale}/characters/${uid}` : null;
      default:
        break;
    }
  }

  const href = resolveLinkHref(linkField);
  return href && locale ? localizeHref(href, locale) : href;
}

export function isExternalHref(href: string): boolean {
  const value = href.trim();
  if (!value || value.startsWith("/") || value.startsWith("#")) return false;
  if (value.startsWith("//")) return true;
  if (/^(mailto:|tel:|sms:)/i.test(value)) return true;

  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

export function resolveLinkProps(
  linkField: unknown,
  options: ResolveLinkOptions = {}
): ResolvedLinkProps | null {
  const href = resolveAppLinkHref(linkField, options.locale);
  if (!href) return null;

  const isExternal = isExternalHref(href);
  const target =
    getLinkTarget(linkField) ?? (isExternal ? options.defaultExternalTarget : undefined);

  return {
    href,
    isExternal,
    target,
    rel: target === "_blank" ? "noopener noreferrer" : undefined,
  };
}

export function localizeHref(href: string, locale: AppLocale): string {
  if (!href || href === "#" || href.startsWith("#")) return href;
  if (!href.startsWith("/")) return href;

  const [pathname, suffix = ""] = href.split(/(?=[?#])/, 2);
  const [, firstSegment, ...restSegments] = pathname.split("/");
  if (isAppLocale(firstSegment)) {
    const restPath = restSegments.join("/");
    const localizedPath = restPath ? `/${locale}/${restPath}` : `/${locale}`;
    return `${localizedPath}${suffix}`;
  }

  const localizedPath = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return `${localizedPath}${suffix}`;
}
