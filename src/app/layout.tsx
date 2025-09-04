import "./globals.css";

import { Inter } from "next/font/google";
import { isFilled } from "@prismicio/client";
import type { RichTextField } from "@prismicio/client";
import { PrismicText } from "@prismicio/react";
import { PrismicNextLink, PrismicPreview, PrismicNextImage } from "@prismicio/next";

import { createClient, repositoryName } from "@/prismicio";
import { Bounded } from "@/components/Bounded";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="overflow-x-hidden antialiased">
        <Header />
        {children}
        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}

async function Header() {
  const client = createClient();
  const settings = await client.getSingle("settings");
  const navigation = await client.getSingle("navigation");

  // Combine primary and secondary links (IDs as defined in the `navigation` custom type)
  const primary = navigation.data.primary_links ?? [];
  const secondary = navigation.data.secondary_links ?? [];
  const links = [...primary, ...secondary];

  const siteTitle = settings.data.site_title;
  const brand = settings.data.brand?.[0];

  function renderLabel(label: unknown) {
    if (isFilled.richText(label as any)) {
      return <PrismicText field={label as RichTextField} />;
    }
    if (isFilled.keyText(label as any)) {
      return label as string;
    }
    return null;
  }

  function hasNavIcon(it: unknown): it is {
    icon_image?: unknown;
    icon_position?: string;
    hide_label?: boolean;
    icon_alt_override?: string;
  } {
    return typeof it === "object" && it !== null && "icon_image" in it;
  }
  function isHideLabel(it: unknown): boolean {
    return typeof it === "object" && it !== null && "hide_label" in it && Boolean((it as any).hide_label);
  }

  return (
    <Bounded as="header" yPadding="sm">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 leading-none">
        <PrismicNextLink href="/" className="inline-flex items-center gap-2">
          {/* Si hay brand configurado, úsalo */}
          {brand ? (
            <>
              {isFilled.image(brand.icon_image) && brand.icon_position !== "right" && (
                <PrismicNextImage
                  field={brand.icon_image}
                  className="h-7 w-auto"
                  fallbackAlt=""
                  priority
                />
              )}

              {!brand.hide_label && renderLabel(brand.label)}

              {isFilled.image(brand.icon_image) && brand.icon_position === "right" && (
                <PrismicNextImage
                  field={brand.icon_image}
                  className="h-7 w-auto"
                  fallbackAlt=""
                  priority
                />
              )}
            </>
          ) : (
            // Fallback si no has rellenado `brand`: intenta logo o site_title
            <>
              {isFilled.image(settings.data.logo) ? (
                <PrismicNextImage
                  field={settings.data.logo}
                  className="h-7 w-auto"
                  fallbackAlt=""
                  priority
                />
              ) : Array.isArray(settings.data.site_title) ? (
                <PrismicText field={settings.data.site_title} />
              ) : (
                settings.data.site_title || "Site"
              )}
            </>
          )}
        </PrismicNextLink>

        <nav>
          <ul className="flex flex-wrap gap-6 md:gap-10">
            {links.map((item, i) => (
              <li
                key={`nav-${i}`}
                className="font-semibold tracking-tight text-slate-800"
              >
                <PrismicNextLink field={item.link} className="flex items-center gap-2">
                  {/* Icono a la izquierda si existe y no es 'right' */}
                  {hasNavIcon(item) && isFilled.image((item as any).icon_image) && (item as any).icon_position !== "right" && (
                    <PrismicNextImage
                      field={(item as any).icon_image}
                      className="h-6 w-auto"
                      fallbackAlt=""
                      priority
                    />
                  )}

                  {/* Texto (si no está hide_label) */}
                  {!isHideLabel(item) && renderLabel(item.label)}

                  {/* Icono a la derecha si existe y la posición es 'right' */}
                  {hasNavIcon(item) && isFilled.image((item as any).icon_image) && (item as any).icon_position === "right" && (
                    <PrismicNextImage
                      field={(item as any).icon_image}
                      className="h-6 w-auto"
                      fallbackAlt=""
                      priority
                    />
                  )}
                </PrismicNextLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Bounded>
  );
}
