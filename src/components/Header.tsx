"use client";

import { Content, asLink, asText } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import Link from "next/link";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon, { getSocialKey } from "@/components/SocialIcon";
import { LOCALE_COOKIE_NAME, type AppLocale } from "@/lib/locale";
import { localizeHref } from "@/lib/links";

type Props = {
  settings: Content.SettingsDocument;
  navigation: Content.NavigationDocument | null;
  currentLocale: AppLocale;
};

function persistLocalePreference(locale: AppLocale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export default function Header({ settings, navigation, currentLocale }: Props) {
  const [open, setOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const nav = navigation?.data.primary_links ?? [];
  const navItems = nav.map((n) => ({
    href: asLink(n.link) ?? "",
    label: asText(n.label),
    link: n.link,
  }));
  const socials = settings.data.social_links ?? [];
  const headerSocials = socials.filter((s) => {
    const iconLabel =
      s.icon_key && getSocialKey(s.icon_key) !== "other"
        ? s.icon_key
        : s.label || s.icon_key || "";
    const key = getSocialKey(iconLabel);
    return key === "instagram" || key === "tiktok" || key === "patreon";
  });
  const siteTitle = asText(settings.data.site_title) || "Heirs of the Collapse";
  const brandData = settings.data as typeof settings.data & {
    header_logo?: typeof settings.data.logo | null;
  };
  const headerLogo = brandData.header_logo?.url
    ? brandData.header_logo
    : settings.data.logo;
  const labels = {
    language: currentLocale === "es" ? "Idioma" : "Language",
    primaryNav: currentLocale === "es" ? "Navegación principal" : "Primary navigation",
    socialNav: currentLocale === "es" ? "Redes sociales" : "Social media",
    menuOpen: currentLocale === "es" ? "Abrir menú principal" : "Open main menu",
    menuClose: currentLocale === "es" ? "Cerrar menú principal" : "Close main menu",
    mobileNav: currentLocale === "es" ? "Navegación móvil" : "Mobile navigation",
  };

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
              sizes="(max-width: 767px) 180px, 220px"
            />
          ) : (
            <span className="hotc-logo-mask hotc-logo-mask--heirs" />
          )}
        </Link>

        <nav className="hotc-header__nav" aria-label={labels.primaryNav}>
          {navItems.map((item, i) => (
            <PrismicNextLink
              key={i}
              field={item.link}
              className={`hotc-header__nav-item${
                pathname && item.href === pathname ? " is-active" : ""
              }`}
            >
              {item.label}
            </PrismicNextLink>
          ))}
        </nav>

        <div className="hotc-header__actions">
          <div
            className="hotc-header__lang"
            role="group"
            aria-label={labels.language}
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
          <nav className="hotc-header__socials" aria-label={labels.socialNav}>
            {headerSocials.map((s, i) => {
              const iconLabel =
                s.icon_key && getSocialKey(s.icon_key) !== "other"
                  ? s.icon_key
                  : s.label || s.icon_key || "";
              return (
                <PrismicNextLink
                  key={i}
                  field={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hotc-header__icon"
                  aria-label={s.label || "Social"}
                >
                  <SocialIcon label={iconLabel} />
                </PrismicNextLink>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="hotc-header__burger"
            aria-label={open ? labels.menuClose : labels.menuOpen}
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
          aria-label={labels.mobileNav}
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
                  sizes="180px"
                />
              ) : (
                <span className="hotc-logo-mask hotc-logo-mask--heirs" />
              )}
            </Link>
            <button
              type="button"
              className="hotc-header__burger"
              aria-label={labels.menuClose}
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="hotc-header__drawer-nav" aria-label={labels.mobileNav}>
            {navItems.map((item, i) => {
              return (
                <PrismicNextLink
                  key={i}
                  field={item.link}
                  onClick={() => setOpen(false)}
                  className={
                    pathname && item.href === pathname ? "is-active" : ""
                  }
                >
                  <span>{item.label}</span>
                  <span aria-hidden>→</span>
                </PrismicNextLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
