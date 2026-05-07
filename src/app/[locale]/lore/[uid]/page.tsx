import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import Link from "next/link";
import { createClient, SLICE_FETCH_LINKS } from "@/prismicio";
import { isAppLocale, toPrismicLang, type AppLocale } from "@/lib/locale";
import PrismicImage from "@/components/PrismicImage";
import { buildPageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/server-locale";
import { filterVisibleDocuments, isDocumentVisible } from "@/lib/content-visibility";
import {
  formatUiText,
  getLocalizedLoreCategory,
  getUiCopy,
} from "@/lib/ui-copy";

type Props = { params: Promise<{ locale: AppLocale; uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, uid } = await params;
  const copy = getUiCopy(locale);
  const lang = toPrismicLang(locale);
  const client = createClient();
  const [item, settings] = await Promise.all([
    client
      .getByUID("lore_entry", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
      .catch(() => null),
    getSettings(locale),
  ]);
  if (!isDocumentVisible(item)) return {};
  const title = `${item.data.title ?? uid} — ${copy.lore.titleSuffix}`;
  const socialImage =
    item.data.meta_image?.url ||
    item.data.cover?.url ||
    settings?.data.og_default?.url ||
    settings?.data.meta_image?.url ||
    undefined;

  return buildPageMetadata({
    locale,
    document: item,
    title,
    imageUrl: socialImage,
    imageAlt: item.data.meta_image?.alt || item.data.title || title,
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
  const items = await client.getAllByType("lore_entry", { lang });
  return filterVisibleDocuments(items).map((i) => ({ uid: i.uid }));
}

/**
 * Lore entry detail page — faithfully replicates LoreProfile.jsx
 * from ui_kits/website using the hotc-cprofile__* CSS classes.
 */
export default async function LoreDetailPage({ params }: Props) {
  const { locale, uid } = await params;
  const copy = getUiCopy(locale);
  const lang = toPrismicLang(locale);
  const client = createClient();
  const item = await client
    .getByUID("lore_entry", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);
  if (!isDocumentVisible(item)) notFound();
  const itemTitle = item.data.title?.trim() || item.uid || copy.lore.entryFallback;

  return (
    <article>
      {/* Hero — replicates LoreProfile's hotc-cprofile__hero section */}
      <section className="hotc-cprofile__hero">
        {item.data.cover?.url ? (
          <div className="hotc-cprofile__bg">
            <PrismicImage
              field={item.data.cover}
              fallbackAlt={formatUiText(copy.lore.coverArtwork, { name: itemTitle })}
              fill
              sizes="100vw"
              quality={75}
              className="hotc-cprofile__bg-img"
            />
          </div>
        ) : null}
        <div className="hotc-cprofile__overlay" />

        <div className="bounded hotc-cprofile__hero-inner">
          <div className="hotc-cprofile__hero-head">
            <Link href={`/${locale}/lore`} className="hotc-cprofile__back">
              ← {copy.lore.back}
            </Link>
            {item.data.category ? (
              <span
                className="hotc-kicker"
                style={{ color: "var(--hotc-ember)" }}
              >
                {getLocalizedLoreCategory(item.data.category || null, locale)}
              </span>
            ) : null}
          </div>
          <h1 className="hotc-cprofile__name">{item.data.title}</h1>
          {item.data.epithet ? (
            <p className="hotc-cprofile__epithet">{item.data.epithet}</p>
          ) : null}
        </div>
      </section>

      {/* Body — SliceZone for rich lore content */}
      {item.data.slices && item.data.slices.length > 0 ? (
        <section className="bounded bounded--base">
          <div className="hotc-cprofile__bio">
            <SliceZone
              slices={item.data.slices}
              components={components}
              context={{ locale }}
            />
          </div>
        </section>
      ) : null}

      {/* Cover image as body if no slices */}
      {(!item.data.slices || item.data.slices.length === 0) &&
      item.data.cover?.url ? (
        <section className="bounded bounded--base">
          <div className="hotc-cprofile__bio">
            <PrismicImage
              field={item.data.cover}
              className="hotc-twi__img"
              fallbackAlt={itemTitle}
              sizes="(max-width: 767px) 100vw, 960px"
              quality={75}
            />
          </div>
        </section>
      ) : null}
    </article>
  );
}
