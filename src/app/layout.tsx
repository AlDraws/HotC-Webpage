import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { asText } from "@prismicio/client";
import { createClient } from "@/prismicio";

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
  const client = createClient();
  const settings = await client.getSingle("settings").catch(() => null);
  const siteTitle =
    settings?.data.meta_title ||
    asText(settings?.data.site_title) ||
    "Heirs of the Collapse";
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
      icon: [{ url: "/favicon.ico" }],
      shortcut: ["/favicon.ico"],
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
  const client = createClient();
  const settings = await client.getSingle("settings").catch(() => null);
  const navigation = await client.getSingle("navigation").catch(() => null);

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="hotc flex min-h-full flex-col">
        {settings && navigation ? (
          <Header settings={settings} navigation={navigation} />
        ) : null}
        <main className="flex-1">{children}</main>
        {settings && navigation ? (
          <Footer settings={settings} navigation={navigation} />
        ) : null}
      </body>
    </html>
  );
}
