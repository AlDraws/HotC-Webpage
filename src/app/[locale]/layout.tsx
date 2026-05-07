import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LightboxProvider } from "@/components/LightboxProvider";
import ScrollReset from "@/components/ScrollReset";
import { RootDocument } from "../root-document";
import {
  isAppLocale,
  SUPPORTED_LOCALES,
} from "@/lib/locale";
import {
  buildStaticAlternates,
  getDefaultSiteDescription,
  getMetaDescriptionText,
  metadataBase,
  SITE_NAME,
} from "@/lib/seo";
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

  const settings = await getSettings(locale);
  const siteDescription = getMetaDescriptionText(
    settings?.data.meta_description,
    getDefaultSiteDescription(locale),
  );
  const ogImage =
    settings?.data.og_default?.url || settings?.data.meta_image?.url || undefined;
  const alternates = buildStaticAlternates(locale, "/");

  return {
    metadataBase,
    alternates,
    title: {
      template: `%s — ${SITE_NAME}`,
      default: SITE_NAME,
    },
    description: siteDescription,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "es" ? "es_ES" : "en_US",
      alternateLocale: SUPPORTED_LOCALES
        .filter((supportedLocale) => supportedLocale !== locale)
        .map((supportedLocale) => (supportedLocale === "es" ? "es_ES" : "en_US")),
      url:
        typeof alternates.canonical === "string" || alternates.canonical instanceof URL
          ? alternates.canonical
          : alternates.canonical?.url,
      title: SITE_NAME,
      description: siteDescription,
      images: ogImage ? [{ url: ogImage, alt: SITE_NAME }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: SITE_NAME,
      description: siteDescription,
      images: ogImage ? [ogImage] : undefined,
    },
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
      <LightboxProvider locale={locale}>
        <ScrollReset />
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
