import { Content, asText } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

type Props = {
  settings: Content.SettingsDocument;
  navigation: Content.NavigationDocument | null;
};

const SOCIAL_ICONS: Record<string, string> = {
  instagram: "M7.8 2h8.4C19 2 22 5 22 7.8v8.4A5.8 5.8 0 0116.2 22H7.8C5 22 2 19 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  youtube: "M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.8 31.8 0 000 12a31.8 31.8 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.8 31.8 0 0024 12a31.8 31.8 0 00-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
  discord: "M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.74 19.74 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 00-.031-.03z",
  tiktok: "M16.6 5.82A4.28 4.28 0 0115.04 2h-3.28v13.67a2.57 2.57 0 01-2.56 2.57 2.57 2.57 0 01-2.57-2.57 2.57 2.57 0 012.57-2.57c.27 0 .52.04.76.11V9.87a5.9 5.9 0 00-.76-.05 5.9 5.9 0 00-5.9 5.9A5.9 5.9 0 009.2 21.6a5.9 5.9 0 005.9-5.9V8.6A7.58 7.58 0 0019.56 10V6.72a4.28 4.28 0 01-2.96-.9z",
  tumblr: "M14.43 20.2c-3.19 0-4.6-2.24-4.6-4.16V10.4H8V8.2c2.26-.82 3.15-2.79 3.35-4.2h2.22v3.9h3.2v2.5h-3.2v5.3c0 1.21.6 1.92 1.74 1.92.59 0 1.15-.19 1.46-.34v2.35c-.54.26-1.46.57-2.34.57z",
  github: "M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.71c-2.78.6-3.37-1.2-3.37-1.2-.45-1.15-1.1-1.45-1.1-1.45-.9-.62.06-.61.06-.61 1 .07 1.52 1.03 1.52 1.03.89 1.52 2.33 1.08 2.9.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0112 6.85c.85 0 1.7.12 2.5.36 1.9-1.3 2.74-1.03 2.74-1.03.56 1.38.21 2.4.11 2.65.64.7 1.02 1.6 1.02 2.69 0 3.84-2.35 4.68-4.58 4.93.36.31.69.92.69 1.86v2.75c0 .27.18.58.69.48A10 10 0 0012 2z",
};

function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase().replace(/\s+/g, "");
  const d = SOCIAL_ICONS[key];
  if (!d) return <span className="text-xs">{label[0]}</span>;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d={d} />
    </svg>
  );
}

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

export default function Footer({ settings, navigation }: Props) {
  const socials = settings.data.social_links ?? [];
  const nav = navigation?.data.primary_links ?? [];
  const siteTitle = asText(settings.data.site_title) || "Heirs of the Collapse";
  const siteByHref = getLinkHref(settings.data.site_by_link);
  const siteByText = settings.data.site_by_text || "Site by";
  const fallbackCopyright = `© ${new Date().getFullYear()} ${siteTitle}. All rights reserved.`;

  return (
    <footer className="hotc-footer">
      <div className="bounded hotc-footer__inner">
        <div className="hotc-footer__brand">
          <Link href="/" className="hotc-footer__logo" aria-label={siteTitle}>
            {settings.data.logo?.url ? (
              <BrandLogo
                src={settings.data.logo.url}
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
              <Link key={i} href={getLinkHref(n.link)}>
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
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={getLinkHref(s.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hotc-header__icon"
                  aria-label={s.label || "Social"}
                >
                  <SocialIcon label={s.icon_key || s.label || ""} />
                </a>
              ))}
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
