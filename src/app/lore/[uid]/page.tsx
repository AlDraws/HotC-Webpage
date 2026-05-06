import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrismicNextImage } from "@prismicio/next";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import Link from "next/link";
import { createClient, SLICE_FETCH_LINKS } from "@/prismicio";
import { getRequestPrismicLang } from "@/lib/server-locale";

type Props = { params: Promise<{ uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const lang = await getRequestPrismicLang();
  const client = createClient();
  const item = await client
    .getByUID("lore_entry", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);
  if (!item) return {};
  return {
    title: `${item.data.title ?? uid} — Worldbuilding — Heirs of the Collapse`,
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const items = await client.getAllByType("lore_entry");
  return items.map((i) => ({ uid: i.uid }));
}

/**
 * Lore entry detail page — faithfully replicates LoreProfile.jsx
 * from ui_kits/website using the hotc-cprofile__* CSS classes.
 */
export default async function LoreDetailPage({ params }: Props) {
  const { uid } = await params;
  const lang = await getRequestPrismicLang();
  const client = createClient();
  const item = await client
    .getByUID("lore_entry", uid, { lang, fetchLinks: SLICE_FETCH_LINKS })
    .catch(() => null);
  if (!item) notFound();



  return (
    <article>
      {/* Hero — replicates LoreProfile's hotc-cprofile__hero section */}
      <section className="hotc-cprofile__hero">
        {item.data.cover?.url ? (
          <div
            className="hotc-cprofile__bg"
            style={{ backgroundImage: `url(${item.data.cover.url})` }}
          />
        ) : null}
        <div className="hotc-cprofile__overlay" />

        <div className="bounded hotc-cprofile__hero-inner">
          <Link href="/lore" className="hotc-cprofile__back">
            ← Worldbuilding
          </Link>
          {item.data.category ? (
            <span
              className="hotc-kicker"
              style={{ color: "var(--hotc-ember)" }}
            >
              {item.data.category}
            </span>
          ) : null}
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
            <SliceZone slices={item.data.slices} components={components} />
          </div>
        </section>
      ) : null}

      {/* Cover image as body if no slices */}
      {(!item.data.slices || item.data.slices.length === 0) &&
      item.data.cover?.url ? (
        <section className="bounded bounded--base">
          <div className="hotc-cprofile__bio">
            <PrismicNextImage
              field={item.data.cover}
              className="hotc-twi__img"
              fallbackAlt=""
            />
          </div>
        </section>
      ) : null}


    </article>
  );
}
