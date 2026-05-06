import { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { asText } from "@prismicio/client";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { getRequestPrismicLang } from "@/lib/server-locale";

export default async function Home() {
  const lang = await getRequestPrismicLang();
  const client = createClient();
  const page = await client.getSingle("home", { lang }).catch(() => null);

  if (!page) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Home page content not found. Please create it in Prismic.</p>
      </div>
    );
  }

  return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestPrismicLang();
  const client = createClient();
  const page = await client.getSingle("home", { lang }).catch(() => null);

  if (!page) return {};

  return {
    title: page.data.meta_title ?? undefined,
    description: page.data.meta_description
      ? asText(page.data.meta_description)
      : undefined,
  };
}
