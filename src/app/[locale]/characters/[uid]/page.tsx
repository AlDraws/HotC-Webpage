import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import { asText } from "@prismicio/client";
import Link from "next/link";
import { createClient, SLICE_FETCH_LINKS } from "@/prismicio";
import { components } from "@/slices";
import { normalizeSlices } from "@/lib/prismic-slices";
import { isAppLocale, toPrismicLang, type AppLocale } from "@/lib/locale";
import PrismicImage from "@/components/PrismicImage";
import { buildPageMetadata, metadataBase, SITE_NAME } from "@/lib/seo";
import { getSettings } from "@/lib/server-locale";
import { filterVisibleDocuments, isDocumentVisible } from "@/lib/content-visibility";
import { formatUiText, getLocalizedCharacterRole, getUiCopy } from "@/lib/ui-copy";

type Props = { params: Promise<{ locale: AppLocale; uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, uid } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const [ch, settings] = await Promise.all([
    client.getByUID("character", uid, { lang }).catch(() => null),
    getSettings(locale),
  ]);
  if (!isDocumentVisible(ch)) return {};
  const title = ch.data.name ?? uid;
  const socialImage =
    ch.data.meta_image?.url ||
    ch.data.portrait?.url ||
    ch.data.cover?.url ||
    settings?.data.og_default?.url ||
    settings?.data.meta_image?.url ||
    undefined;

  return buildPageMetadata({
    locale,
    document: ch,
    title,
    imageUrl: socialImage,
    imageAlt: ch.data.meta_image?.alt || ch.data.name || title,
  });
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isAppLocale(params.locale)) return [];
  const lang = toPrismicLang(params.locale);
  const client = createClient();
  const chars = await client.getAllByType("character", { lang });
  return filterVisibleDocuments(chars).map((ch) => ({ uid: ch.uid }));
}

/**
 * Character profile page — faithfully replicates CharacterProfile.jsx
 * from ui_kits/website using the hotc-cprofile__* CSS classes.
 */
export default async function CharacterProfilePage({ params }: Props) {
  const { locale, uid } = await params;
  const copy = getUiCopy(locale);
  const lang = toPrismicLang(locale);
  const client = createClient();
  const ch = await client
    .getByUID("character", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);
  if (!isDocumentVisible(ch)) notFound();

  const attributes = ch.data.attributes ?? [];
  const gallery = ch.data.gallery ?? [];
  const slices = normalizeSlices(ch.data.slices);
  const characterName = ch.data.name?.trim() || ch.uid || copy.character.fallbackName;
  const characterUrl = new URL(`/${locale}/characters/${ch.uid}`, metadataBase).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: characterName,
    description: ch.data.short_bio ? asText(ch.data.short_bio) || undefined : undefined,
    image:
      ch.data.portrait?.url || ch.data.cover?.url || ch.data.meta_image?.url || undefined,
    url: characterUrl,
    inLanguage: locale,
    memberOf: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero — hotc-cprofile__hero with cover background */}
      <section className="hotc-cprofile__hero">
        {ch.data.cover?.url ? (
          <div className="hotc-cprofile__bg">
            <PrismicImage
              field={ch.data.cover}
              fallbackAlt={formatUiText(copy.character.coverArtwork, { name: characterName })}
              fill
              sizes="100vw"
              quality={75}
              className="hotc-cprofile__bg-img"
            />
          </div>
        ) : null}
        <div className="hotc-cprofile__overlay" />

        <div className="bounded hotc-cprofile__hero-inner">
          <Link href={`/${locale}/characters`} className="hotc-cprofile__back">
            ← {copy.character.castBack}
          </Link>
          <div className="hotc-cprofile__hero-grid">
            {/* Portrait card */}
            {ch.data.portrait?.url ? (
              <div className="hotc-cprofile__portrait-card">
                <PrismicImage
                  field={ch.data.portrait}
                  className="hotc-cprofile__portrait"
                  sizes="(max-width: 767px) 220px, 280px"
                  quality={75}
                  fallbackAlt={formatUiText(copy.character.portraitOf, { name: characterName })}
                />
              </div>
            ) : null}

            {/* Intro: role, name, epithet, attributes */}
            <div className="hotc-cprofile__intro">
              {ch.data.role ? (
                <span className="hotc-kicker" style={{ color: "var(--hotc-ember)" }}>
                  {getLocalizedCharacterRole(ch.data.role, locale)}
                </span>
              ) : null}
              {ch.data.name ? <h1 className="hotc-cprofile__name">{ch.data.name}</h1> : null}
              {ch.data.epithet ? <p className="hotc-cprofile__epithet">{ch.data.epithet}</p> : null}

              {attributes.length > 0 ? (
                <div className="hotc-cprofile__attrs">
                  {attributes.map((a, i) => (
                    <div key={i} className="hotc-cprofile__attr">
                      <span className="hotc-attr-label">{a.label}</span>
                      <span className="hotc-cprofile__attr-value">{a.value}</span>
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
          <h2 className="hotc-h3">{copy.character.bio}</h2>
          {ch.data.short_bio ? <PrismicRichText field={ch.data.short_bio} /> : null}
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 ? (
        <section className="bounded bounded--base" style={{ paddingTop: 0 }}>
          <div className="hotc-cprofile__gallery">
            <h2 className="hotc-h3">{copy.character.gallery}</h2>
            <div className="hotc-cprofile__gallery-grid">
              {gallery.map((g, i) =>
                g.image?.url ? (
                  <div key={i} className="hotc-cprofile__gallery-tile">
                    <PrismicImage
                      field={g.image}
                      fallbackAlt={formatUiText(copy.character.galleryImage, {
                        name: characterName,
                        index: i + 1,
                      })}
                      fill
                      sizes="(max-width: 639px) 100vw, 33vw"
                      quality={75}
                      className="hotc-cprofile__gallery-img"
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </section>
      ) : null}

      {slices.length > 0 ? (
        <SliceZone slices={slices} components={components} context={{ locale }} />
      ) : null}
    </article>
  );
}
