import { Content, asText } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon, { getSocialKey } from "@/components/SocialIcon";
import type { AppLocale } from "@/lib/locale";
import { localizeHref } from "@/lib/links";

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

export default function Footer({ settings, navigation, currentLocale }: Props) {
  const socials = settings.data.social_links ?? [];
  const nav = navigation?.data.primary_links ?? [];
  const siteTitle = asText(settings.data.site_title) || "Heirs of the Collapse";
  const siteByHref = getLinkHref(settings.data.site_by_link);
  const siteByText = settings.data.site_by_text || "Site by";
  const fallbackCopyright = `© ${new Date().getFullYear()} ${siteTitle}. All rights reserved.`;
  const brandData = settings.data as typeof settings.data & {
    footer_logo?: { url?: string | null } | null;
  };
  const footerLogoUrl = brandData.footer_logo?.url || settings.data.logo?.url;

  return (
    <footer className="hotc-footer">
      <div className="bounded hotc-footer__inner">
        <div className="hotc-footer__brand">
          <Link
            href={`/${currentLocale}`}
            className="hotc-footer__logo"
            aria-label={siteTitle}
          >
            {footerLogoUrl ? (
              <BrandLogo
                src={footerLogoUrl}
                alt={siteTitle}
                className="h-20 w-auto object-contain"
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
          <div className="hotc-footer__col">
            <h4>Navigate</h4>
            {nav.map((n, i) => (
              <Link
                key={i}
                href={localizeHref(getLinkHref(n.link), currentLocale)}
              >
                {asText(n.label)}
              </Link>
            ))}
          </div>
          <div className="hotc-footer__col">
            <h4>Follow</h4>
            {socials.map((s, i) => (
              <a
                key={i}
                href={getLinkHref(s.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label || "Social"}
              </a>
            ))}
          </div>
          <div className="hotc-footer__col">
            <h4>Social</h4>
            <div className="flex gap-2 pt-1">
              {socials.map((s, i) => {
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
          </div>
        </div>
      </div>

      <div className="bounded hotc-footer__base">
        {settings.data.copyright ? (
          <PrismicRichText field={settings.data.copyright} />
        ) : (
          <span>{fallbackCopyright}</span>
        )}
        <a
          className="hotc-footer__attr"
          href={siteByHref}
          target={siteByHref.startsWith("http") ? "_blank" : undefined}
          rel={siteByHref.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={siteByText}
        >
          <span className="hotc-footer__attr-by">{siteByText}</span>
          {settings.data.site_by_logo?.url ? (
            <BrandLogo
              src={settings.data.site_by_logo.url}
              alt={siteByText}
              className="h-[18px] w-auto object-contain"
            />
          ) : (
            <span className="hotc-logo-mask hotc-logo-mask--alvaro" />
          )}
        </a>
      </div>
    </footer>
  );
}
