"use client";

import { Content, asText } from "@prismicio/client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

type Props = {
  settings: Content.SettingsDocument;
  navigation: Content.NavigationDocument | null;
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

export default function Header({ settings, navigation }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const nav = navigation?.data.primary_links ?? [];
  const siteTitle = asText(settings.data.site_title) || "Heirs of the Collapse";
  const brand = settings.data.brand?.[0];
  const brandLabel = brand?.hide_label ? "" : brand?.label;
  const brandIcon = brand?.icon_image?.url;
  const isIconLeft = (brand?.icon_position || "left") === "left";

  return (
    <header className="hotc-header">
      <div className="bounded hotc-header__inner">
        <Link href="/" className="hotc-header__logo" aria-label={siteTitle}>
          {settings.data.logo?.url ? (
            <BrandLogo
              src={settings.data.logo.url}
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
          {brand?.label || brandIcon ? (
            <Link href={getLinkHref(brand.link)} className="hotc-btn hotc-btn--ghost">
              {isIconLeft && brandIcon ? (
                <img
                  src={brandIcon}
                  alt={brand?.icon_alt_override || brand?.label || "Brand"}
                  className="h-4 w-4 object-contain"
                />
              ) : null}
              {brandLabel}
              {!isIconLeft && brandIcon ? (
                <img
                  src={brandIcon}
                  alt={brand?.icon_alt_override || brand?.label || "Brand"}
                  className="h-4 w-4 object-contain"
                />
              ) : null}
            </Link>
          ) : null}
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
              {settings.data.logo?.url ? (
                <BrandLogo
                  src={settings.data.logo.url}
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
