"use client";

import { Content, asText } from "@prismicio/client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon, { getSocialKey } from "@/components/SocialIcon";
import { LOCALE_COOKIE_NAME, type AppLocale } from "@/lib/locale";

type Props = {
  settings: Content.SettingsDocument;
  navigation: Content.NavigationDocument | null;
  currentLocale: AppLocale;
};

function getLinkHref(linkField: unknown): string {
  if (
    linkField &&
    typeof linkField === "object" &&
    "url" in linkField &&
    typeof (linkField as { url?: unknown }).url === "string" &&
    (linkField as { url: string }).url
  ) {
    return (linkField as { url: string }).url;
  }
  return "#";
}

export default function Header({ settings, navigation, currentLocale }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const nav = navigation?.data.primary_links ?? [];
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
    header_logo?: { url?: string | null } | null;
  };
  const headerLogoUrl = brandData.header_logo?.url || settings.data.logo?.url;

  function switchLocale(locale: AppLocale) {
    if (locale === currentLocale) return;
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <header className="hotc-header">
      <div className="bounded hotc-header__inner">
        <Link href="/" className="hotc-header__logo" aria-label={siteTitle}>
          {headerLogoUrl ? (
            <BrandLogo
              src={headerLogoUrl}
              alt={siteTitle}
              className="h-full w-auto object-contain"
            />
          ) : (
            <span className="hotc-logo-mask hotc-logo-mask--heirs" />
          )}
        </Link>

        <nav className="hotc-header__nav">
          {nav.map((n, i) => (
            <Link
              key={i}
              href={getLinkHref(n.link)}
              className={`hotc-header__nav-item${
                pathname && getLinkHref(n.link) === pathname ? " is-active" : ""
              }`}
            >
              {asText(n.label)}
            </Link>
          ))}
        </nav>

        <div className="hotc-header__actions">
          <div className="hotc-header__lang" role="group" aria-label="Language">
            <button
              type="button"
              className={`hotc-header__lang-btn${
                currentLocale === "en" ? " is-active" : ""
              }`}
              onClick={() => switchLocale("en")}
              aria-pressed={currentLocale === "en"}
            >
              EN
            </button>
            <button
              type="button"
              className={`hotc-header__lang-btn${
                currentLocale === "es" ? " is-active" : ""
              }`}
              onClick={() => switchLocale("es")}
              aria-pressed={currentLocale === "es"}
            >
              ES
            </button>
          </div>
          <div className="hotc-header__socials" aria-label="Social links">
            {headerSocials.map((s, i) => {
              const iconLabel =
                s.icon_key && getSocialKey(s.icon_key) !== "other"
                  ? s.icon_key
                  : s.label || s.icon_key || "";
              return (
                <a
                  key={i}
                  href={getLinkHref(s.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hotc-header__icon"
                  aria-label={s.label || "Social"}
                >
                  <SocialIcon label={iconLabel} />
                </a>
              );
            })}
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="hotc-header__burger"
            aria-label="Menu"
            aria-expanded={open}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="hotc-header__drawer" role="dialog" aria-modal="true">
          <div className="hotc-header__drawer-head">
            <Link
              href="/"
              className="hotc-header__logo"
              aria-label={siteTitle}
              onClick={() => setOpen(false)}
            >
              {headerLogoUrl ? (
                <BrandLogo
                  src={headerLogoUrl}
                  alt={siteTitle}
                  className="h-full w-auto object-contain"
                />
              ) : (
                <span className="hotc-logo-mask hotc-logo-mask--heirs" />
              )}
            </Link>
            <button
              className="hotc-header__burger"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="hotc-header__drawer-nav">
            {nav.map((n, i) => {
              const href = getLinkHref(n.link);
              return (
                <Link
                  key={i}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={pathname && href === pathname ? "is-active" : ""}
                >
                  <span>{asText(n.label)}</span>
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
