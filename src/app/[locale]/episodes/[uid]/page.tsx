import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { asText } from "@prismicio/client";
import { components } from "@/slices";
import Link from "next/link";
import { createClient, SLICE_FETCH_LINKS } from "@/prismicio";
import { isAppLocale, toPrismicLang, type AppLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/server-locale";
import type { EpisodePanelSequenceContext } from "@/slices/episode_panel/sequence-context";

type Props = { params: Promise<{ locale: AppLocale; uid: string }> };

const EPISODE_NAV_LABELS = {
  en: {
    prev: "Previous Episode",
    next: "Next Episode",
  },
  es: {
    prev: "Episodio anterior",
    next: "Próximo episodio",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, uid } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const [ep, settings] = await Promise.all([
    client
      .getByUID("episode", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
      .catch(() => null),
    getSettings(locale),
  ]);
  if (!ep) return {};
  const title =
    ep.data.meta_title ??
    `Chapter ${ep.data.chapter_number}: ${ep.data.title}`;
  const description = ep.data.meta_description
    ? asText(ep.data.meta_description)
    : undefined;
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
  return episodes.map((ep) => ({ uid: ep.uid }));
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
  if (!ep) notFound();

  // Prev / next for chapter navigation (ascending order → prev is lower number)
  const idx = allEpisodes.findIndex((e) => e.id === ep.id);
  const prev = idx > 0 ? allEpisodes[idx - 1] : null;
  const next = idx < allEpisodes.length - 1 ? allEpisodes[idx + 1] : null;
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
  const sliceContext: EpisodePanelSequenceContext = {
    sequenceId: ep.id,
    panelOrderBySliceIndex,
  };
  const navLabels = EPISODE_NAV_LABELS[locale];
  const prevButtonLabel = settings?.data.prev_button_label?.trim() || navLabels.prev;
  const nextButtonLabel = settings?.data.next_button_label?.trim() || navLabels.next;

  return (
    <article className="hotc-ereader hotc--cinema">
      {/* Episode header — replicates EpisodeReader.__head */}
      <div className="hotc-ereader__head">
        <Link href={`/${locale}/episodes`} className="hotc-ereader__back">
          ← Archive
        </Link>
        <span className="hotc-ereader__chapter">
          Chapter {ep.data.chapter_number ?? "—"}
        </span>
        <h1 className="hotc-ereader__title">{ep.data.title}</h1>
        <p className="hotc-ereader__date">
          {ep.data.publish_date ?? ""}
          {ep.data.summary
            ? ` · ${asText(ep.data.summary).slice(0, 80)}`
            : ""}
        </p>
      </div>

      {/* Comic strip — SliceZone renders panels, beats, dividers */}
      <div className="hotc-ereader__strip">
        <SliceZone
          slices={ep.data.slices}
          components={components}
          context={sliceContext}
        />
      </div>

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
            <span className="hotc-attr-label">CH. {ep.data.chapter_number}</span>
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
