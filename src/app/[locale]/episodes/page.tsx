import { Metadata } from "next";
import { asText } from "@prismicio/client";
import Link from "next/link";
import PrismicImage from "@/components/PrismicImage";
import { createClient } from "@/prismicio";
import { filterVisibleDocuments } from "@/lib/content-visibility";
import { toPrismicLang, type AppLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/seo";
import {
  formatUiText,
  getLocalizedEpisodeArc,
  getUiCopy,
} from "@/lib/ui-copy";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = getUiCopy(locale);

  return buildPageMetadata({
    locale,
    pathname: "/episodes",
    title: copy.seo.pages.episodes.title,
    description: copy.seo.pages.episodes.description,
  });
}

export default async function EpisodesPage({ params }: Props) {
  const { locale } = await params;
  const copy = getUiCopy(locale);
  const lang = toPrismicLang(locale);
  const client = createClient();
  const episodesIndex = await client
    .getSingle("episodes_index", { lang })
    .catch(() => null);
  const episodes = await client.getAllByType("episode", {
    lang,
    orderings: [{ field: "my.episode.chapter_number", direction: "desc" }],
  });
  const visibleEpisodes = filterVisibleDocuments(episodes);
  const arcs = ["Prologue", "Arc I", "Arc II", "Arc III", "Epilogue"] as const;
  const intro = episodesIndex?.data.intro_richtext
    ? asText(episodesIndex.data.intro_richtext)
    : copy.episodes.introFallback;

  return (
    <>
      <section className="bounded hotc-page__head">
        <span className="hotc-kicker">{copy.episodes.archive}</span>
        <h1 className="hotc-h1">{copy.episodes.title}</h1>
        <p className="hotc-page__intro">{intro}</p>
      </section>

      <section className="bounded bounded--base" style={{ paddingTop: 0 }}>
        <div className="mb-6 flex flex-wrap gap-2">
          {arcs.map((arc) => (
            <span key={arc} className="hotc-btn hotc-btn--ghost">
              {getLocalizedEpisodeArc(arc, locale)}
            </span>
          ))}
        </div>
        <div className="hotc-eidx__grid">
          {visibleEpisodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/${locale}/episodes/${ep.uid}`}
              className="hotc-ep-card"
            >
              {/* Cover */}
              <div className="hotc-ep-card__cover">
                {ep.data.cover?.url ? (
                  <PrismicImage
                    field={ep.data.cover}
                    fallbackAlt={
                      ep.data.title ||
                      formatUiText(copy.episodes.fallbackCardAlt, {
                        uid: ep.uid || "",
                      })
                    }
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    quality={75}
                    className="object-cover"
                  />
                ) : null}
              </div>

              {/* Meta */}
              <div>
                <span className="hotc-ep-card__date">
                  {formatUiText(copy.episodes.chapterShort, {
                    number: ep.data.chapter_number ?? "—",
                  })}&nbsp;·&nbsp;
                  {ep.data.publish_date ?? ""}
                </span>
                <h3 className="hotc-ep-card__title">{ep.data.title}</h3>
                {ep.data.summary ? (
                  <p className="hotc-ep-card__synopsis">
                    {asText(ep.data.summary)}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
