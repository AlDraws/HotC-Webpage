"use client";

import { Content, asLink, asText } from "@prismicio/client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon, { getSocialKey } from "@/components/SocialIcon";
import { LOCALE_COOKIE_NAME, type AppLocale } from "@/lib/locale";
import {
  getLinkTarget,
  resolveAppLinkHref,
  isExternalHref,
  localizeHref,
  resolveLinkHref,
} from "@/lib/links";
import { getUiCopy } from "@/lib/ui-copy";

type Props = {
  settings: Content.SettingsDocument;
  navigation: Content.NavigationDocument | null;
  currentLocale: AppLocale;
};

function persistLocalePreference(locale: AppLocale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export default function Header({ settings, navigation, currentLocale }: Props) {
  const copy = getUiCopy(currentLocale);
  const [open, setOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const nav = navigation?.data.primary_links ?? [];
  const navItems = nav.map((n) => ({
    href: resolveAppLinkHref(n.link, currentLocale) ?? asLink(n.link) ?? "",
    label: asText(n.label),
    target: getLinkTarget(n.link),
  }));
  const socials = settings.data.social_links ?? [];
  const headerSocials = socials.reduce<
    Array<{
      href: string;
      iconLabel: string;
      label: string;
      target?: string;
    }>
  >((items, s) => {
    const iconLabel =
      s.icon_key && getSocialKey(s.icon_key) !== "other"
        ? s.icon_key
        : s.label || s.icon_key || "";
    const key = getSocialKey(iconLabel);
    const href = resolveLinkHref(s.url);
    if (!href || (key !== "instagram" && key !== "tiktok" && key !== "patreon")) {
      return items;
    }

    items.push({
      href,
      iconLabel,
      label: s.label || iconLabel || copy.common.socialFallbackLabel,
      target: getLinkTarget(s.url),
    });
    return items;
  }, []);
  const siteTitle = asText(settings.data.site_title) || copy.common.siteTitleFallback;
  const brandData = settings.data as typeof settings.data & {
    header_logo?: typeof settings.data.logo | null;
  };
  const headerLogo = brandData.header_logo?.url
    ? brandData.header_logo
    : settings.data.logo;
  function switchLocale(locale: AppLocale) {
    if (locale === currentLocale || isPending) return;

    setPendingLocale(locale);
    persistLocalePreference(locale);

    startTransition(() => {
      router.push(localizeHref(pathname || "/", locale));
    });
  }

  return (
    <header className="hotc-header">
      <div className="bounded hotc-header__inner">
        <Link
          href={`/${currentLocale}`}
          className="hotc-header__logo"
          aria-label={siteTitle}
        >
          {headerLogo?.url ? (
            <BrandLogo
              field={headerLogo}
              alt={siteTitle}
              className="h-full w-auto object-contain"
              width={headerLogo?.dimensions?.width}
              height={headerLogo?.dimensions?.height}
              sizes="(max-width: 767px) 96px, 140px"
              loading="eager"
              fetchPriority="low"
              quality={60}
            />
          ) : (
            <span className="hotc-logo-mask hotc-logo-mask--heirs" />
          )}
        </Link>

        <nav className="hotc-header__nav" aria-label={copy.header.primaryNav}>
          {navItems.map((item, i) => (
            item.href ? (
              isExternalHref(item.href) ? (
                <a
                  key={i}
                  href={item.href}
                  target={item.target ?? "_blank"}
                  rel="noopener noreferrer"
                  className="hotc-header__nav-item"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={i}
                  href={item.href}
                  className={`hotc-header__nav-item${
                    pathname &&
                    item.href.split(/[#?]/, 1)[0] === pathname
                      ? " is-active"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              )
            ) : null
          ))}
        </nav>

        <div className="hotc-header__actions">
          <div
            className="hotc-header__lang"
            role="group"
            aria-label={copy.header.language}
            aria-busy={isPending}
          >
            {(["en", "es"] as const).map((locale) => {
              const isActive = currentLocale === locale;
              const isLocalePending = isPending && pendingLocale === locale;

              return (
                <button
                  key={locale}
                  type="button"
                  className={`hotc-header__lang-btn${
                    isActive ? " is-active" : ""
                  }${isLocalePending ? " is-pending" : ""}`}
                  onClick={() => switchLocale(locale)}
                  aria-pressed={isActive}
                  aria-busy={isLocalePending}
                  disabled={isPending}
                >
                  <span>{locale.toUpperCase()}</span>
                  {isLocalePending ? (
                    <span
                      className="hotc-header__lang-spinner"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <nav className="hotc-header__socials" aria-label={copy.header.socialNav}>
            {headerSocials.map((s, i) => {
              const target = s.target ?? (isExternalHref(s.href) ? "_blank" : undefined);
              return (
                <a
                  key={i}
                  href={s.href}
                  target={target}
                  rel={target === "_blank" ? "noopener noreferrer" : undefined}
                  className="hotc-header__icon"
                  aria-label={s.label}
                >
                  <SocialIcon label={s.iconLabel} />
                </a>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="hotc-header__burger"
            aria-label={open ? copy.header.menuClose : copy.header.menuOpen}
            aria-expanded={open}
            aria-controls="hotc-mobile-menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="hotc-mobile-menu"
          className="hotc-header__drawer"
          role="dialog"
          aria-modal="true"
          aria-label={copy.header.mobileNav}
        >
          <div className="hotc-header__drawer-head">
            <Link
              href={`/${currentLocale}`}
              className="hotc-header__logo"
              aria-label={siteTitle}
              onClick={() => setOpen(false)}
            >
              {headerLogo?.url ? (
                <BrandLogo
                  field={headerLogo}
                  alt={siteTitle}
                  className="h-full w-auto object-contain"
                  width={headerLogo?.dimensions?.width}
                  height={headerLogo?.dimensions?.height}
                  sizes="96px"
                  loading="lazy"
                  fetchPriority="low"
                  quality={60}
                />
              ) : (
                <span className="hotc-logo-mask hotc-logo-mask--heirs" />
              )}
            </Link>
            <button
              type="button"
              className="hotc-header__burger"
              aria-label={copy.header.menuClose}
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="hotc-header__drawer-nav" aria-label={copy.header.mobileNav}>
            {navItems.map((item, i) => {
              if (!item.href) return null;

              const isActive =
                pathname && item.href.split(/[#?]/, 1)[0] === pathname;

              if (isExternalHref(item.href)) {
                return (
                  <a
                    key={i}
                    href={item.href}
                    target={item.target ?? "_blank"}
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.label}</span>
                    <span aria-hidden>→</span>
                  </a>
                );
              }

              return (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={isActive ? "is-active" : ""}
                >
                  <span>{item.label}</span>
                  <span aria-hidden>→</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
