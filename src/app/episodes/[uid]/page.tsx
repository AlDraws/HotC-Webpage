import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText, isFilled } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import Link from "next/link";

import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { PrismicRichText } from "@/components/PrismicRichText";

type Params = { uid: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const page = await client
    .getByUID<Content.EpisodeDocument>("episode", uid)
    .catch(() => notFound());

  return {
    title: page.data.meta_title || page.data.title || undefined,
    description: asText(page.data.meta_description) || undefined,
    openGraph: {
      title: page.data.meta_title || page.data.title || undefined,
      images: page.data.meta_image?.url ? [{ url: page.data.meta_image.url }] : undefined,
    },
  };
}

export default async function EpisodePage({ params }: { params: Promise<Params> }) {
  const { uid } = await params;
  const client = createClient();
  const page = await client
    .getByUID<Content.EpisodeDocument>("episode", uid)
    .catch(() => notFound());

  // Fetch all episodes and sort by chapter_number to build prev/next navigation
  const allEpisodes = await client.getAllByType("episode");
  const sortedEpisodes = allEpisodes.sort((a, b) => {
    const aNum = a.data.chapter_number || 0;
    const bNum = b.data.chapter_number || 0;
    return aNum - bNum;
  });

  const currentIndex = sortedEpisodes.findIndex((ep) => ep.uid === uid);
  const prevEp = currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : null;
  const nextEp = currentIndex < sortedEpisodes.length - 1 ? sortedEpisodes[currentIndex + 1] : null;

  const NavLinks = () => (
    <div className="w-full max-w-[1080px] mx-auto flex justify-between items-center py-4 px-6 border-y border-slate-800/60 my-6 bg-[#0B0B0E] text-white">
      {prevEp ? (
        <Link href={`/episodes/${prevEp.uid}`} className="hover:text-amber-500 transition-colors uppercase font-bold text-xs sm:text-sm tracking-wider">
          &larr; Anterior {prevEp.data.chapter_number ? `(${prevEp.data.chapter_number})` : ""}
        </Link>
      ) : <span className="text-slate-600 uppercase font-bold text-xs sm:text-sm tracking-wider">Inicio</span>}
      
      <span className="font-mono text-amber-500/80 font-bold hidden sm:inline-block text-sm">
        {page.data.chapter_number ? `Capítulo ${page.data.chapter_number}` : "Episodio"}
      </span>
      
      {nextEp ? (
        <Link href={`/episodes/${nextEp.uid}`} className="hover:text-amber-500 transition-colors uppercase font-bold text-xs sm:text-sm tracking-wider">
          Siguiente {nextEp.data.chapter_number ? `(${nextEp.data.chapter_number})` : ""} &rarr;
        </Link>
      ) : <span className="text-slate-600 uppercase font-bold text-xs sm:text-sm tracking-wider">Último</span>}
    </div>
  );

  const hasHeaderContent = isFilled.keyText(page.data.title) || isFilled.image(page.data.cover) || isFilled.richText(page.data.summary);

  return (
    <article className="bg-[#0B0B0E] min-h-screen pb-16">
      {hasHeaderContent ? (
        <Bounded yPadding="sm">
          {isFilled.keyText(page.data.title) ? <Heading as="h1" className="text-slate-100">{page.data.title}</Heading> : null}
          {isFilled.image(page.data.cover) ? (
            <div className="mt-6 overflow-hidden rounded-md">
              <PrismicNextImage
                field={page.data.cover}
                className="h-auto w-full"
                sizes="100vw"
                quality={100}
                imgixParams={{ q: 100, auto: null }}
                fallbackAlt=""
              />
            </div>
          ) : null}
          {isFilled.richText(page.data.summary) ? (
            <div className="mt-6 text-slate-300">
              <PrismicRichText field={page.data.summary} />
            </div>
          ) : null}
        </Bounded>
      ) : null}

      <NavLinks />
      <SliceZone slices={page.data.slices} components={components} />
      <NavLinks />
    </article>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("episode");
  return pages.map((doc) => ({ uid: doc.uid! }));
}
