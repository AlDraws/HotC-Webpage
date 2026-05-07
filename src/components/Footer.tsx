import { Content, asText } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon, { getSocialKey } from "@/components/SocialIcon";
import type { AppLocale } from "@/lib/locale";
import {
  getLinkTarget,
  isExternalHref,
  resolveAppLinkHref,
  resolveLinkHref,
} from "@/lib/links";
import { formatUiText, getUiCopy } from "@/lib/ui-copy";

type Props = {
  settings: Content.SettingsDocument;
  navigation: Content.NavigationDocument | null;
  currentLocale: AppLocale;
};

export default function Footer({ settings, navigation, currentLocale }: Props) {
  const copy = getUiCopy(currentLocale);
  const socials = settings.data.social_links ?? [];
  const nav = navigation?.data.primary_links ?? [];
  const navItems = nav.map((n) => ({
    href: resolveAppLinkHref(n.link, currentLocale) ?? "",
    label: asText(n.label),
    target: getLinkTarget(n.link),
  }));
  const siteTitle = asText(settings.data.site_title) || copy.common.siteTitleFallback;
  const siteByHref = resolveLinkHref(settings.data.site_by_link) ?? "";
  const siteByText = settings.data.site_by_text || copy.footer.siteByFallback;
  const fallbackCopyright = formatUiText(copy.footer.copyrightFallback, {
    year: new Date().getFullYear(),
    siteTitle,
  });
  const brandData = settings.data as typeof settings.data & {
    footer_logo?: typeof settings.data.logo | null;
    site_by_logo?: typeof settings.data.logo | null;
  };
  const footerLogo = brandData.footer_logo?.url
    ? brandData.footer_logo
    : settings.data.logo;
  const socialLinks = socials.flatMap((s) => {
    const href = resolveLinkHref(s.url);
    if (!href) return [];

    const target = getLinkTarget(s.url) ?? (isExternalHref(href) ? "_blank" : undefined);
    const iconLabel =
      s.icon_key && getSocialKey(s.icon_key) !== "other"
        ? s.icon_key
        : s.label || s.icon_key || "";

    return [
      {
        href,
        target,
        rel: target === "_blank" ? "noopener noreferrer" : undefined,
        label: s.label || iconLabel || copy.common.socialFallbackLabel,
        iconLabel,
      },
    ];
  });

  return (
    <footer className="hotc-footer">
      <div className="bounded hotc-footer__inner">
        <div className="hotc-footer__brand">
          <Link
            href={`/${currentLocale}`}
            className="hotc-footer__logo"
            aria-label={siteTitle}
          >
            {footerLogo?.url ? (
              <BrandLogo
                field={footerLogo}
                alt={siteTitle}
                className="h-20 w-auto object-contain"
                width={footerLogo?.dimensions?.width}
                height={footerLogo?.dimensions?.height}
                sizes="220px"
              />
            ) : (
              <span className="hotc-logo-mask hotc-logo-mask--heirs" />
            )}
          </Link>
          {settings.data.tagline ? (
            <p className="hotc-footer__tag">{settings.data.tagline}</p>
          ) : settings.data.footer_text ? (
            <div className="hotc-footer__tag">
              <PrismicRichText field={settings.data.footer_text} />
            </div>
          ) : null}
        </div>

        <div className="hotc-footer__cols">
          <nav className="hotc-footer__col" aria-label={copy.footer.footerNav}>
            <p className="hotc-footer__title">{copy.footer.navigate}</p>
            {navItems.map((item, i) =>
              !item.href ? null : isExternalHref(item.href) ? (
                <a
                  key={i}
                  href={item.href}
                  target={item.target ?? "_blank"}
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              ) : (
                <Link key={i} href={item.href}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <nav className="hotc-footer__col" aria-label={copy.footer.socialLinks}>
            <p className="hotc-footer__title">{copy.footer.follow}</p>
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target={s.target}
                rel={s.rel}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <nav className="hotc-footer__col" aria-label={copy.footer.socialIcons}>
            <p className="hotc-footer__title">{copy.footer.social}</p>
            <div className="flex gap-2 pt-1">
              {socialLinks.map((s, i) => {
                return (
                  <a
                    key={i}
                    href={s.href}
                    target={s.target}
                    rel={s.rel}
                    className="hotc-header__icon"
                    aria-label={s.label}
                  >
                    <SocialIcon label={s.iconLabel} />
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <div className="bounded hotc-footer__base">
        {settings.data.copyright ? (
          <PrismicRichText field={settings.data.copyright} />
        ) : (
          <span>{fallbackCopyright}</span>
        )}
        {siteByHref ? (
          <a
            className="hotc-footer__attr"
            href={siteByHref}
            target={siteByHref.startsWith("http") ? "_blank" : undefined}
            rel={siteByHref.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={siteByText}
          >
            <span className="hotc-footer__attr-by">{siteByText}</span>
            {brandData.site_by_logo?.url ? (
              <BrandLogo
                field={brandData.site_by_logo}
                decorative
                className="h-[18px] w-auto object-contain"
                width={brandData.site_by_logo.dimensions?.width}
                height={brandData.site_by_logo.dimensions?.height}
                sizes="100px"
                quality={60}
              />
            ) : (
              <span className="hotc-logo-mask hotc-logo-mask--alvaro" />
            )}
          </a>
        ) : (
          <span className="hotc-footer__attr" aria-label={siteByText}>
            <span className="hotc-footer__attr-by">{siteByText}</span>
            {brandData.site_by_logo?.url ? (
              <BrandLogo
                field={brandData.site_by_logo}
                decorative
                className="h-[18px] w-auto object-contain"
                width={brandData.site_by_logo.dimensions?.width}
                height={brandData.site_by_logo.dimensions?.height}
                sizes="100px"
                quality={60}
              />
            ) : (
              <span className="hotc-logo-mask hotc-logo-mask--alvaro" />
            )}
          </span>
        )}
      </div>
    </footer>
  );
}
