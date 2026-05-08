import { Metadata } from "next";
import Link from "next/link";
import PrismicImage from "@/components/PrismicImage";
import { createClient } from "@/prismicio";
import { filterVisibleDocuments } from "@/lib/content-visibility";
import { toPrismicLang, type AppLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/seo";
import { getLocalizedLoreCategory, getLocalizedLoreCategoryKicker, getUiCopy } from "@/lib/ui-copy";

/**
 * Lore / Worldbuilding index — replicates App.jsx "lore" route:
 *   - Page head (kicker, h1, intro)
 *   - ItemGrid sections grouped by category (Environment / Prop / Illustration)
 *   - Uses hotc-cgrid__* classes from Worldbuilding.jsx
 */
type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = getUiCopy(locale);

  return buildPageMetadata({
    locale,
    pathname: "/lore",
    title: copy.seo.pages.lore.title,
    description: copy.seo.pages.lore.description,
  });
}

export default async function LorePage({ params }: Props) {
  const { locale } = await params;
  const copy = getUiCopy(locale);
  const lang = toPrismicLang(locale);
  const client = createClient();
  const items = filterVisibleDocuments(await client.getAllByType("lore_entry", { lang }));

  // Group by category field (select: Environment | Prop | Illustration)
  const order = ["Environment", "Prop", "Illustration"];
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    const cat = (item.data.category as string) || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  const sortedGroups = [
    ...order.filter((k) => groups[k]),
    ...Object.keys(groups).filter((k) => !order.includes(k)),
  ];

  return (
    <>
      {/* Page head — replicates WorldbuildingHub header */}
      <section className="bounded hotc-page__head">
        <span className="hotc-kicker">{copy.lore.archive}</span>
        <h1 className="hotc-h1">{copy.lore.title}</h1>
        <p className="hotc-page__intro">{copy.lore.intro}</p>
      </section>

      {/* Category sections — replicates ItemGrid usage in WorldbuildingHub */}
      {sortedGroups.map((category) => (
        <section key={category} className="bounded bounded--base" style={{ paddingTop: "1.5rem" }}>
          <div className="hotc-cgrid__head">
            <span className="hotc-kicker">{getLocalizedLoreCategoryKicker(category, locale)}</span>
            <h2 className="hotc-h2">{getLocalizedLoreCategory(category, locale, "plural")}</h2>
          </div>
          <div
            className={`hotc-cgrid__grid${
              category === "Illustration" ? "hotc-cgrid__grid--wide" : ""
            }`}
          >
            {groups[category].map((item) => (
              <Link key={item.id} href={`/${locale}/lore/${item.uid}`} className="hotc-cgrid__cell">
                <div
                  className="hotc-cgrid__portrait"
                  style={category === "Illustration" ? { aspectRatio: "4 / 3" } : undefined}
                >
                  {item.data.cover?.url ? (
                    <PrismicImage
                      field={item.data.cover}
                      fallbackAlt={item.data.title || item.uid || copy.lore.entryFallback}
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                      quality={65}
                      className="hotc-cgrid__portrait-img"
                    />
                  ) : null}
                </div>
                <div className="hotc-cgrid__meta">
                  {item.data.role ? (
                    <span className="hotc-cgrid__role">{item.data.role}</span>
                  ) : null}
                  <span className="hotc-cgrid__name">{item.data.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
