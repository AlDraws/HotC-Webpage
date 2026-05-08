"use client";

import { Content, asLink, asText } from "@prismicio/client";
import Link from "next/link";
import { useState, useTransition, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon, { getSocialKey } from "@/components/SocialIcon";
import { type AppLocale } from "@/lib/locale";
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

export default function Header({ settings, navigation, currentLocale }: Props) {
  const copy = getUiCopy(currentLocale);
  const [open, setOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);
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
      s.icon_key && getSocialKey(s.icon_key) !== "other" ? s.icon_key : s.label || s.icon_key || "";
    const key = getSocialKey(iconLabel);
    const href = resolveLinkHref(s.url);
    if (!href || !["instagram", "tiktok", "patreon", "kickstarter", "kofi"].includes(key)) {
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
  const headerLogo = brandData.header_logo?.url ? brandData.header_logo : settings.data.logo;

  function switchLocale(locale: AppLocale) {
    if (locale === currentLocale || isPending) return;

    setOpen(false);
    setPendingLocale(locale);

    // Best-effort: set HttpOnly cookie server-side so the proxy remembers the preference
    fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    }).catch(() => {});

    startTransition(() => {
      router.push(localizeHref(pathname || "/", locale));
    });
  }

  return (
    <header className={open ? "hotc-header is-open" : "hotc-header"}>
      <div className="bounded hotc-header__inner">
        <Link href={`/${currentLocale}`} className="hotc-header__logo" aria-label={siteTitle}>
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
          {navItems.map((item, i) =>
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
                  className={
                    pathname && item.href.split(/[#?]/, 1)[0] === pathname
                      ? "hotc-header__nav-item is-active"
                      : "hotc-header__nav-item"
                  }
                >
                  {item.label}
                </Link>
              )
            ) : null
          )}
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
                  className={[
                    "hotc-header__lang-btn",
                    isActive && "is-active",
                    isLocalePending && "is-pending",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => switchLocale(locale)}
                  aria-pressed={isActive}
                  aria-busy={isLocalePending}
                  disabled={isPending}
                >
                  <span>{locale.toUpperCase()}</span>
                  {isLocalePending ? (
                    <span className="hotc-header__lang-spinner" aria-hidden="true" />
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="hotc-mobile-menu"
        ref={drawerRef}
        className={open ? "hotc-header__drawer is-open" : "hotc-header__drawer"}
        aria-hidden={!open}
      >
        <nav className="hotc-header__drawer-nav" aria-label={copy.header.mobileNav}>
          {navItems.map((item, i) => {
            if (!item.href) return null;

            const isActive = pathname && item.href.split(/[#?]/, 1)[0] === pathname;

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
    </header>
  );
}
