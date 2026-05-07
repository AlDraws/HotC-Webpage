import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { asText } from "@prismicio/client";
import { components } from "@/slices";
import Link from "next/link";
import { createClient, SLICE_FETCH_LINKS } from "@/prismicio";
import { isAppLocale, toPrismicLang, type AppLocale } from "@/lib/locale";
import {
  buildPageMetadata,
  getDefaultSiteDescription,
  getMetaDescriptionText,
  metadataBase,
  SITE_NAME,
} from "@/lib/seo";
import { getSettings } from "@/lib/server-locale";
import type { EpisodePanelSequenceContext } from "@/slices/episode_panel/sequence-context";
import { filterVisibleDocuments, isDocumentVisible } from "@/lib/content-visibility";
import { formatUiText, getUiCopy } from "@/lib/ui-copy";

type Props = { params: Promise<{ locale: AppLocale; uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, uid } = await params;
  const copy = getUiCopy(locale);
  const lang = toPrismicLang(locale);
  const client = createClient();
  const [ep, settings] = await Promise.all([
    client
      .getByUID("episode", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
      .catch(() => null),
    getSettings(locale),
  ]);
  if (!isDocumentVisible(ep)) return {};
  const title =
    ep.data.meta_title?.trim() ||
    formatUiText(copy.episodes.chapterTitle, {
      number: ep.data.chapter_number ?? "",
      title: ep.data.title || "",
    });
  const description = getMetaDescriptionText(
    ep.data.meta_description,
    getMetaDescriptionText(ep.data.summary, getDefaultSiteDescription(locale)),
  );
  const socialImage =
    ep.data.meta_image?.url ||
    ep.data.cover?.url ||
    settings?.data.og_default?.url ||
    settings?.data.meta_image?.url ||
    undefined;

  return buildPageMetadata({
    locale,
    document: ep,
    title,
    description,
    imageUrl: socialImage,
    imageAlt: ep.data.meta_image?.alt || ep.data.title || title,
    type: "article",
  });
}

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  if (!isAppLocale(params.locale)) return [];
  const lang = toPrismicLang(params.locale);
  const client = createClient();
  const episodes = await client.getAllByType("episode", { lang });
  return filterVisibleDocuments(episodes).map((ep) => ({ uid: ep.uid }));
}

/**
 * Episode reader — webtoon-style vertical scroll.
 * Replicates EpisodeReader.jsx from ui_kits/website/ faithfully:
 *  - Cinema background (hotc-ereader / hotc--cinema)
 *  - Header: back button, chapter label, title, date
 *  - Strip: SliceZone renders episode_panel / episode_text_beat / episode_divider
 *  - Sticky prev/next nav
 */
export default async function EpisodeReaderPage({ params }: Props) {
  const { locale, uid } = await params;
  const copy = getUiCopy(locale);
  const lang = toPrismicLang(locale);
  const client = createClient();
  const [ep, settings, allEpisodes] = await Promise.all([
    client
      .getByUID("episode", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
      .catch(() => null),
    getSettings(locale),
    client.getAllByType("episode", {
      lang,
      orderings: [{ field: "my.episode.chapter_number", direction: "asc" }],
    }),
  ]);
  if (!isDocumentVisible(ep)) notFound();
  const visibleEpisodes = filterVisibleDocuments(allEpisodes);

  // Prev / next for chapter navigation (ascending order → prev is lower number)
  const idx = visibleEpisodes.findIndex((e) => e.id === ep.id);
  const prev = idx > 0 ? visibleEpisodes[idx - 1] : null;
  const next = idx < visibleEpisodes.length - 1 ? visibleEpisodes[idx + 1] : null;
  const panelOrderBySliceIndex = ep.data.slices.reduce<{
    panelMap: Record<number, number>;
    panelOrder: number;
  }>(
    (acc, slice, sliceIndex) => {
      if (slice.slice_type !== "episode_panel") {
        return acc;
      }

      return {
        panelMap: {
          ...acc.panelMap,
          [sliceIndex]: acc.panelOrder,
        },
        panelOrder: acc.panelOrder + 1,
      };
    },
    { panelMap: {}, panelOrder: 0 },
  ).panelMap;
  const sliceContext: EpisodePanelSequenceContext & { locale: AppLocale } = {
    locale,
    sequenceId: ep.id,
    panelOrderBySliceIndex,
  };
  const prevButtonLabel = settings?.data.prev_button_label?.trim() || copy.episodes.nav.prev;
  const nextButtonLabel = settings?.data.next_button_label?.trim() || copy.episodes.nav.next;
  const chapterLabel = formatUiText(copy.episodes.chapterLabel, {
    number: ep.data.chapter_number ?? "",
  }).trim();
  const summaryText = getMetaDescriptionText(
    ep.data.summary,
    getDefaultSiteDescription(locale),
  );
  const episodeUrl = new URL(`/${locale}/episodes/${ep.uid}`, metadataBase).toString();
  const archiveUrl = new URL(`/${locale}/episodes`, metadataBase).toString();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "ComicIssue",
      name: ep.data.title || chapterLabel,
      headline: ep.data.title || chapterLabel,
      description: summaryText,
      url: episodeUrl,
      inLanguage: locale,
      isPartOf: {
        "@type": "ComicSeries",
        name: SITE_NAME,
        url: new URL(`/${locale}`, metadataBase).toString(),
      },
      issueNumber: ep.data.chapter_number ?? undefined,
      datePublished: ep.data.publish_date || undefined,
      image: ep.data.cover?.url || ep.data.meta_image?.url || undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE_NAME,
          item: new URL(`/${locale}`, metadataBase).toString(),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: copy.episodes.breadcrumbTitle,
          item: archiveUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: ep.data.title || chapterLabel,
          item: episodeUrl,
        },
      ],
    },
  ];

  return (
    <article className="hotc-ereader hotc--cinema">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Episode header — replicates EpisodeReader.__head */}
      <div className="hotc-ereader__head">
        <Link href={`/${locale}/episodes`} className="hotc-ereader__back">
          ← {copy.episodes.archive}
        </Link>
        <span className="hotc-ereader__chapter">
          {chapterLabel}
        </span>
        <h1 className="hotc-ereader__title">{ep.data.title}</h1>
        <p className="hotc-ereader__date">
          {ep.data.publish_date ?? ""}
          {ep.data.summary
            ? ` · ${asText(ep.data.summary).slice(0, 80)}`
            : ""}
        </p>
        <section className="sr-only" aria-label={copy.episodes.synopsisAria}>
          <h2>{copy.episodes.synopsisTitle}</h2>
          <p>{summaryText}</p>
        </section>
      </div>

      {/* Comic strip — SliceZone renders panels, beats, dividers */}
      <div className="hotc-ereader__strip">
        <SliceZone
          slices={ep.data.slices}
          components={components}
          context={sliceContext}
        />
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(()=>{const load=i=>{if(!i||i.dataset.hotcLoaded)return;i.dataset.hotcLoaded='true';if(i.dataset.sizes)i.sizes=i.dataset.sizes;if(i.dataset.srcset)i.srcset=i.dataset.srcset;if(i.dataset.src)i.src=i.dataset.src;i.removeAttribute('data-src');i.removeAttribute('data-srcset');i.removeAttribute('data-sizes')};const run=()=>{const imgs=document.querySelectorAll('img[data-hotc-deferred-comic]');if(!('IntersectionObserver'in window)){imgs.forEach(load);return}const io=new IntersectionObserver(es=>{for(const e of es){if(e.isIntersecting){io.unobserve(e.target);load(e.target)}}},{rootMargin:'900px 0px'});imgs.forEach(i=>io.observe(i))};const start=()=>{('requestIdleCallback'in window)?requestIdleCallback(run,{timeout:1200}):setTimeout(run,600)};document.readyState==='complete'?start():window.addEventListener('load',start,{once:true})})();",
        }}
      />

      {/* Sticky prev/next nav — replicates EpisodeReader.__nav */}
      <nav className="hotc-ereader__nav">
        <div className="hotc-ereader__nav-inner">
          <Link
            href={prev ? `/${locale}/episodes/${prev.uid}` : "#"}
            aria-disabled={!prev}
            className="hotc-btn hotc-btn--ghost !px-4 !py-2 !text-sm"
          >
            ← {prevButtonLabel}
          </Link>

          <div className="hotc-ereader__progress">
            <span className="hotc-attr-label">
              {formatUiText(copy.episodes.chapterShort, {
                number: ep.data.chapter_number ?? "",
              })}
            </span>
          </div>

          <Link
            href={next ? `/${locale}/episodes/${next.uid}` : "#"}
            aria-disabled={!next}
            className="hotc-btn hotc-btn--ember !px-4 !py-2 !text-sm"
          >
            {nextButtonLabel} →
          </Link>
        </div>
      </nav>
    </article>
  );
}
