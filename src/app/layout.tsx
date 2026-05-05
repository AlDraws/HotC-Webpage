import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { asText } from "@prismicio/client";
import { createClient } from "@/prismicio";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const settings = await client.getSingle("settings");
  const siteTitle = asText(settings.data.site_title) ?? "Heirs of the Collapse";
  return {
    title: {
      template: `%s — ${siteTitle}`,
      default: siteTitle,
    },
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

  if (!settings) return <>{children}</>;

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-950 font-sans text-on-ink">
        <Header settings={settings} navigation={navigation} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} navigation={navigation} />
      </body>
    </html>
  );
}
