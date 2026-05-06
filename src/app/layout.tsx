import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LightboxProvider } from "@/components/LightboxProvider";
import { asText } from "@prismicio/client";
import { createClient } from "@/prismicio";
import { getRequestLocale, getRequestPrismicLang } from "@/lib/server-locale";

const inter = localFont({
  src: [
    {
      path: "../../fonts/Inter-VariableFont_opsz_wght.ttf",
      style: "normal",
    },
    {
      path: "../../fonts/Inter-Italic-VariableFont_opsz_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = "Heirs of the Collapse";
  const lang = await getRequestPrismicLang();
  const client = createClient();
  const settings = await client.getSingle("settings", { lang }).catch(() => null);
  const siteDescription = settings?.data.meta_description
    ? asText(settings.data.meta_description)
    : undefined;
  const ogImage =
    settings?.data.og_default?.url || settings?.data.meta_image?.url || undefined;

  return {
    title: {
      template: `%s — ${siteTitle}`,
      default: siteTitle,
    },
    description: siteDescription,
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
    },
    openGraph: ogImage
      ? {
          images: [{ url: ogImage }],
        }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  const lang = await getRequestPrismicLang();
  const client = createClient();
  const settings = await client.getSingle("settings", { lang }).catch(() => null);
  const navigation = await client.getSingle("navigation", { lang }).catch(() => null);

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="hotc flex min-h-full flex-col">
        <LightboxProvider>
          {settings && navigation ? (
            <Header
              settings={settings}
              navigation={navigation}
              currentLocale={locale}
            />
          ) : null}
          <main className="flex-1">{children}</main>
          {settings && navigation ? (
            <Footer settings={settings} navigation={navigation} />
          ) : null}
        </LightboxProvider>
      </body>
    </html>
  );
}
