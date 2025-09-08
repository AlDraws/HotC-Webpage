import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText, isFilled, type Content } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";

async function getHomepageDoc(client: ReturnType<typeof createClient>) {
  // 1) Intenta el singleton `home`; 2) fallback a `page` con UID `home`.
  const home = await client.getSingle<Content.HomeDocument>("home").catch(() => null);
  if (home) return home;
  const pageHome = await client
    .getByUID<Content.PageDocument>("page", "home")
    .catch(() => null);
  return pageHome;
}

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const doc = await getHomepageDoc(client);
  if (!doc) notFound();

  // Carga settings para fallback de OG image
  const settings = await client.getSingle("settings").catch(() => null);

  const isPage = doc.type === "page";

  const title = isPage
    ? (doc as Content.PageDocument).data.meta_title || asText((doc as Content.PageDocument).data.title) || undefined
    : (doc as Content.HomeDocument).data.meta_title || (doc as Content.HomeDocument).data.title || undefined;

  const description = isPage
    ? (doc as Content.PageDocument).data.meta_description || undefined
    : asText((doc as Content.HomeDocument).data.meta_description) || undefined;

  // Usa og_image_override si existe; si no, cae a settings.og_default; nunca envíes array vacío
  const ogOverride = (doc.data as any)?.og_image_override;
  const settingsOg = (settings?.data as any)?.og_default;
  const ogUrl = isFilled.image(ogOverride) ? ogOverride.url : isFilled.image(settingsOg) ? settingsOg.url : undefined;

  return {
    title,
    description,
    openGraph: {
      title: title || undefined,
      images: ogUrl ? [{ url: ogUrl }] : undefined,
    },
  };
}

export default async function Page() {
  const client = createClient();
  const doc = await getHomepageDoc(client);
  if (!doc) notFound();

  // Soporta `slices` o `body` según el custom type
  const data: any = doc.data as any;
  const slices = Array.isArray(data.slices) ? data.slices : Array.isArray(data.body) ? data.body : [];

  return <SliceZone slices={slices} components={components} />;
}
