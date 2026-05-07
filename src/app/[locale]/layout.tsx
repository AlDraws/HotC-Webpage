import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LightboxProvider } from "@/components/LightboxProvider";
import { RootDocument } from "../root-document";
import {
  isAppLocale,
  SUPPORTED_LOCALES,
} from "@/lib/locale";
import { getNavigation, getSettings } from "@/lib/server-locale";
import "../globals.css";

type LocaleParams = {
  locale: string;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};

  const siteTitle = "Heirs of the Collapse";
  const settings = await getSettings(locale);
  const siteDescription = settings?.data.meta_description
    ? asText(settings.data.meta_description)
    : undefined;
  const ogImage =
    settings?.data.og_default?.url || settings?.data.meta_image?.url || undefined;

  return {
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
    },
    title: {
      template: `%s — ${siteTitle}`,
      default: siteTitle,
    },
    description: siteDescription,
    openGraph: ogImage
      ? {
          images: [{ url: ogImage }],
        }
      : undefined,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LocaleParams>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  const [settings, navigation] = await Promise.all([
    getSettings(locale),
    getNavigation(locale),
  ]);

  return (
    <RootDocument lang={locale}>
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
          <Footer
            settings={settings}
            navigation={navigation}
            currentLocale={locale}
          />
        ) : null}
      </LightboxProvider>
    </RootDocument>
  );
}
