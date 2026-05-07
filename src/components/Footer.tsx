import { Content, asLink, asText } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon, { getSocialKey } from "@/components/SocialIcon";
import type { AppLocale } from "@/lib/locale";

type Props = {
  settings: Content.SettingsDocument;
  navigation: Content.NavigationDocument | null;
  currentLocale: AppLocale;
};

export default function Footer({ settings, navigation, currentLocale }: Props) {
  const socials = settings.data.social_links ?? [];
  const nav = navigation?.data.primary_links ?? [];
  const navItems = nav.map((n) => ({
    label: asText(n.label),
    link: n.link,
  }));
  const siteTitle = asText(settings.data.site_title) || "Heirs of the Collapse";
  const siteByHref = asLink(settings.data.site_by_link) ?? "";
  const siteByText = settings.data.site_by_text || "Site by";
  const fallbackCopyright = `© ${new Date().getFullYear()} ${siteTitle}. All rights reserved.`;
  const brandData = settings.data as typeof settings.data & {
    footer_logo?: typeof settings.data.logo | null;
    site_by_logo?: typeof settings.data.logo | null;
  };
  const footerLogo = brandData.footer_logo?.url
    ? brandData.footer_logo
    : settings.data.logo;
  const labels = {
    footerNav: currentLocale === "es" ? "Navegación del pie" : "Footer navigation",
    socialLinks: currentLocale === "es" ? "Enlaces sociales" : "Social links",
    socialIcons: currentLocale === "es" ? "Iconos sociales" : "Social icons",
  };

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
          <nav className="hotc-footer__col" aria-label={labels.footerNav}>
            <p className="hotc-footer__title">Navigate</p>
            {navItems.map((item, i) => (
              <PrismicNextLink key={i} field={item.link}>
                {item.label}
              </PrismicNextLink>
            ))}
          </nav>
          <nav className="hotc-footer__col" aria-label={labels.socialLinks}>
            <p className="hotc-footer__title">Follow</p>
            {socials.map((s, i) => (
              <PrismicNextLink
                key={i}
                field={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label || "Social"}
              </PrismicNextLink>
            ))}
          </nav>
          <nav className="hotc-footer__col" aria-label={labels.socialIcons}>
            <p className="hotc-footer__title">Social</p>
            <div className="flex gap-2 pt-1">
              {socials.map((s, i) => {
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
        <PrismicNextLink
          className="hotc-footer__attr"
          field={settings.data.site_by_link}
          target={siteByHref.startsWith("http") ? "_blank" : undefined}
          rel={siteByHref.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={siteByText}
        >
          <span className="hotc-footer__attr-by">{siteByText}</span>
          {brandData.site_by_logo?.url ? (
            <BrandLogo
              field={brandData.site_by_logo}
              alt={siteByText}
              className="h-[18px] w-auto object-contain"
              width={brandData.site_by_logo.dimensions?.width}
              height={brandData.site_by_logo.dimensions?.height}
              sizes="120px"
            />
          ) : (
            <span className="hotc-logo-mask hotc-logo-mask--alvaro" />
          )}
        </PrismicNextLink>
      </div>
    </footer>
  );
}
