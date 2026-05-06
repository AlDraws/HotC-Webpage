import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import Link from "next/link";
import { createClient, SLICE_FETCH_LINKS } from "@/prismicio";
import { components } from "@/slices";
import { normalizeSlices } from "@/lib/prismic-slices";
import { toPrismicLang, type AppLocale } from "@/lib/locale";

type Props = { params: Promise<{ locale: AppLocale; uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, uid } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const ch = await client.getByUID("character", uid, { lang }).catch(() => null);
  if (!ch) return {};
  return { title: `${ch.data.name ?? uid} — Heirs of the Collapse` };
}

export async function generateStaticParams() {
  const client = createClient();
  const chars = await client.getAllByType("character");
  return chars.map((ch) => ({ uid: ch.uid }));
}

/**
 * Character profile page — faithfully replicates CharacterProfile.jsx
 * from ui_kits/website using the hotc-cprofile__* CSS classes.
 */
export default async function CharacterProfilePage({ params }: Props) {
  const { locale, uid } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const ch = await client
    .getByUID("character", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);
  if (!ch) notFound();

  const attributes = ch.data.attributes ?? [];
  const gallery = ch.data.gallery ?? [];
  const slices = normalizeSlices(ch.data.slices);

  return (
    <article>
      {/* Hero — hotc-cprofile__hero with cover background */}
      <section className="hotc-cprofile__hero">
        {ch.data.cover?.url ? (
          <div className="hotc-cprofile__bg">
            <PrismicNextImage
              field={ch.data.cover}
              fallbackAlt=""
              fill
              sizes="100vw"
              className="hotc-cprofile__bg-img"
            />
          </div>
        ) : null}
        <div className="hotc-cprofile__overlay" />

        <div className="bounded hotc-cprofile__hero-inner">
          <Link href={`/${locale}/characters`} className="hotc-cprofile__back">
            ← Cast
          </Link>
          <div className="hotc-cprofile__hero-grid">
            {/* Portrait card */}
            {ch.data.portrait?.url ? (
              <div className="hotc-cprofile__portrait-card">
                <PrismicNextImage
                  field={ch.data.portrait}
                  className="hotc-cprofile__portrait"
                  quality={100}
                  fallbackAlt=""
                />
              </div>
            ) : null}

            {/* Intro: role, name, epithet, attributes */}
            <div className="hotc-cprofile__intro">
              {ch.data.role ? (
                <span
                  className="hotc-kicker"
                  style={{ color: "var(--hotc-ember)" }}
                >
                  {ch.data.role}
                </span>
              ) : null}
              {ch.data.name ? (
                <h1 className="hotc-cprofile__name">{ch.data.name}</h1>
              ) : null}
              {ch.data.epithet ? (
                <p className="hotc-cprofile__epithet">{ch.data.epithet}</p>
              ) : null}

              {attributes.length > 0 ? (
                <div className="hotc-cprofile__attrs">
                  {attributes.map((a, i) => (
                    <div key={i} className="hotc-cprofile__attr">
                      <span className="hotc-attr-label">{a.label}</span>
                      <span className="hotc-cprofile__attr-value">
                        {a.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Bio section */}
      <section className="bounded bounded--base">
        <div className="hotc-cprofile__bio">
          <h3 className="hotc-h3">Bio</h3>
          {ch.data.short_bio ? (
            <PrismicRichText field={ch.data.short_bio} />
          ) : null}
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 ? (
        <section className="bounded bounded--base" style={{ paddingTop: 0 }}>
          <div className="hotc-cprofile__gallery">
            <h3 className="hotc-h3">Gallery</h3>
            <div className="hotc-cprofile__gallery-grid">
              {gallery.map((g, i) =>
                g.image?.url ? (
                  <div
                    key={i}
                    className="hotc-cprofile__gallery-tile"
                  >
                    <PrismicNextImage
                      field={g.image}
                      fallbackAlt=""
                      fill
                      sizes="(max-width: 639px) 100vw, 33vw"
                      className="hotc-cprofile__gallery-img"
                    />
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </section>
      ) : null}

      {slices.length > 0 ? (
        <SliceZone slices={slices} components={components} />
      ) : null}
    </article>
  );
}
