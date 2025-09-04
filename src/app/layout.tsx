import "./globals.css";

import { Inter } from "next/font/google";
import { isFilled } from "@prismicio/client";
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
                  imgprops={{
                    alt:
                      brand.icon_alt_override ||
                      brand.icon_image?.alt ||
                      (Array.isArray(brand.label) ? "brand" : brand.label) ||
                      "brand",
                  }}
                  priority
                />
              )}

              {!brand.hide_label &&
                (Array.isArray(brand.label) ? (
                  <PrismicText field={brand.label} />
                ) : (
                  brand.label
                ))}

              {isFilled.image(brand.icon_image) && brand.icon_position === "right" && (
                <PrismicNextImage
                  field={brand.icon_image}
                  className="h-7 w-auto"
                  imgProps={{
                    alt:
                      brand.icon_alt_override ||
                      brand.icon_image?.alt ||
                      (Array.isArray(brand.label) ? "brand" : brand.label) ||
                      "brand",
                  }}
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
                  imgProps={{
                    alt: settings.data.logo.alt || "Heirs of the Collapse",
                  }}
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
                  {isFilled.image(item.icon_image) && item.icon_position !== "right" && (
                    <PrismicNextImage
                      field={item.icon_image}
                      className="h-6 w-auto"
                      imgProps={{
                        alt:
                          item.icon_alt_override ||
                          item.icon_image?.alt ||
                          (Array.isArray(item.label) ? "link" : item.label) ||
                          "link",
                      }}
                      priority
                    />
                  )}

                  {/* Texto (si no está hide_label) */}
                  {!item.hide_label &&
                    (Array.isArray(item.label) ? (
                      <PrismicText field={item.label} />
                    ) : (
                      item.label
                    ))}

                  {/* Icono a la derecha si existe y la posición es 'right' */}
                  {isFilled.image(item.icon_image) && item.icon_position === "right" && (
                    <PrismicNextImage
                      field={item.icon_image}
                      className="h-6 w-auto"
                      imgProps={{
                        alt:
                          item.icon_alt_override ||
                          item.icon_image?.alt ||
                          (Array.isArray(item.label) ? "link" : item.label) ||
                          "link",
                      }}
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
