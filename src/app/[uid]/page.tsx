import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";

type Params = { uid: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const page = await client.getByUID<Content.PageDocument>("page", uid).catch(() => notFound());

  return {
    title: page.data.meta_title || asText(page.data.title) || undefined,
    description: page.data.meta_description || undefined,
    openGraph: {
      title: page.data.meta_title || undefined,
      images: page.data.meta_image?.url ? [{ url: page.data.meta_image.url }] : undefined,
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;
  const client = createClient();
  const page = await client.getByUID<Content.PageDocument>("page", uid).catch(() => notFound());

  return (
    <>
      {page.data.title?.length ? (
        <Bounded yPadding="sm">
          <Heading as="h1">{asText(page.data.title)}</Heading>
        </Bounded>
      ) : null}
      <SliceZone slices={page.data.slices} components={components} />
    </>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("page");
  return pages.map((page) => ({ uid: page.uid! }));
}
