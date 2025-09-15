import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";
import type { EpisodesIndexDocument } from "../../../prismicio-types";
import { components } from "@/slices";
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client
    .getSingle<Content.EpisodesIndexDocument>("episodes_index")
    .catch(() => notFound());

  return {
    title: page.data.meta_title || "Episodes",
    description: asText(page.data.meta_description) || undefined,
    openGraph: {
      title: page.data.meta_title || "Episodes",
      images: page.data.meta_image?.url ? [{ url: page.data.meta_image.url }] : undefined,
    },
  };
}

export default async function EpisodesIndexPage() {
  const client = createClient();
  const page = await client
    .getSingle<Content.EpisodesIndexDocument>("episodes_index")
    .catch(() => notFound());

  return (
    <>
      {page.data.intro_richtext?.length ? (
        <Bounded yPadding="sm">
          <Heading as="h1">Episodes</Heading>
          <div className="mt-4 text-slate-700 dark:text-slate-300">
            <p>{asText(page.data.intro_richtext)}</p>
          </div>
        </Bounded>
      ) : null}
      <SliceZone slices={page.data.slices} components={components} />
    </>
  );
}
