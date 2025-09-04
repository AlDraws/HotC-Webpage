import "./globals.css";

import { Inter } from "next/font/google";
import { PrismicText } from "@prismicio/react";
import { PrismicNextLink, PrismicPreview } from "@prismicio/next";

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

  return (
    <Bounded as="header" yPadding="sm">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 leading-none">
        <PrismicNextLink href="/" className="text-xl font-semibold tracking-tight">
          {/* site_title puede ser RichText o KeyText; maneja ambos */}
          {Array.isArray(siteTitle) ? (
            <PrismicText field={siteTitle} />
          ) : (
            siteTitle || "Site"
          )}
        </PrismicNextLink>

        <nav>
          <ul className="flex flex-wrap gap-6 md:gap-10">
            {links.map((item, i) => (
              <li
                key={`nav-${i}`}
                className="font-semibold tracking-tight text-slate-800"
              >
                <PrismicNextLink field={item.link}>
                  {/* label puede ser RichText o KeyText según tu schema */}
                  {Array.isArray(item.label) ? (
                    <PrismicText field={item.label} />
                  ) : (
                    item.label
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
