import { Metadata } from "next";
import Link from "next/link";
import PrismicImage from "@/components/PrismicImage";
import { createClient } from "@/prismicio";
import { toPrismicLang, type AppLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/seo";

/**
 * Lore / Worldbuilding index — replicates App.jsx "lore" route:
 *   - Page head (kicker, h1, intro)
 *   - ItemGrid sections grouped by category (Environment / Prop / Illustration)
 *   - Uses hotc-cgrid__* classes from Worldbuilding.jsx
 */
type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    pathname: "/lore",
    title: "Worldbuilding",
    description:
      "Explore the environments, props, and illustrations of Heirs of the Collapse.",
  });
}

export default async function LorePage({ params }: Props) {
  const { locale } = await params;
  const lang = toPrismicLang(locale);
  const client = createClient();
  const items = await client.getAllByType("lore_entry", { lang });

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

  const sectionKickers: Record<string, string> = {
    Environment: "01",
    Prop: "02",
    Illustration: "03",
  };

  return (
    <>
      {/* Page head — replicates WorldbuildingHub header */}
      <section className="bounded hotc-page__head">
        <span className="hotc-kicker">Archive</span>
        <h1 className="hotc-h1">Worldbuilding</h1>
        <p className="hotc-page__intro">
          The places, objects, and images of the Collapse.
        </p>
      </section>

      {/* Category sections — replicates ItemGrid usage in WorldbuildingHub */}
      {sortedGroups.map((category) => (
        <section
          key={category}
          className="bounded bounded--base"
          style={{ paddingTop: "1.5rem" }}
        >
          <div className="hotc-cgrid__head">
            <span className="hotc-kicker">
              {sectionKickers[category] ?? "—"}
            </span>
            <h2 className="hotc-h2">{category}s</h2>
          </div>
          <div
            className={`hotc-cgrid__grid${
              category === "Illustration" ? " hotc-cgrid__grid--wide" : ""
            }`}
          >
            {groups[category].map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/lore/${item.uid}`}
                className="hotc-cgrid__cell"
              >
                <div
                  className="hotc-cgrid__portrait"
                  style={
                    category === "Illustration"
                      ? { aspectRatio: "4 / 3" }
                      : undefined
                  }
                >
                  {item.data.cover?.url ? (
                    <PrismicImage
                      field={item.data.cover}
                      fallbackAlt={item.data.title || item.uid || "Worldbuilding entry"}
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
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
