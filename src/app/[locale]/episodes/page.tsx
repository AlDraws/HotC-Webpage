import { Metadata } from "next";
import { asText } from "@prismicio/client";
import Link from "next/link";
import PrismicImage from "@/components/PrismicImage";
import { createClient } from "@/prismicio";
import { toPrismicLang, type AppLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    pathname: "/episodes",
    title: "Episodes",
    description:
      "Read every chapter of Heirs of the Collapse, a webcomic updating every Sunday.",
  });
}

export default async function EpisodesPage({ params }: Props) {
  const { locale } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const episodesIndex = await client
    .getSingle("episodes_index", { lang })
    .catch(() => null);
  const episodes = await client.getAllByType("episode", {
    lang,
    orderings: [{ field: "my.episode.chapter_number", direction: "desc" }],
  });
  const arcs = ["Prologue", "Arc I", "Arc II", "Arc III", "Epilogue"] as const;
  const intro = episodesIndex?.data.intro_richtext
    ? asText(episodesIndex.data.intro_richtext)
    : "Read the story from the beginning, or jump to the latest chapter.";

  return (
    <>
      <section className="bounded hotc-page__head">
        <span className="hotc-kicker">Archive</span>
        <h1 className="hotc-h1">Episodes</h1>
        <p className="hotc-page__intro">{intro}</p>
      </section>

      <section className="bounded bounded--base" style={{ paddingTop: 0 }}>
        <div className="mb-6 flex flex-wrap gap-2">
          {arcs.map((arc) => (
            <span key={arc} className="hotc-btn hotc-btn--ghost">
              {arc}
            </span>
          ))}
        </div>
        <div className="hotc-eidx__grid">
          {episodes.map((ep) => (
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
                    fallbackAlt={ep.data.title || `Episode ${ep.uid}`}
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
                  CH. {ep.data.chapter_number ?? "—"}&nbsp;·&nbsp;
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
