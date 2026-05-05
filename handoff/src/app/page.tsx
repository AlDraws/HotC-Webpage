import { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function Home() {
  const client = createClient();
  const page = await client.getByUID("page", "home");

  return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getByUID("page", "home");
  return {
    title: page.data.meta_title ?? undefined,
    description: page.data.meta_description ?? undefined,
  };
}
