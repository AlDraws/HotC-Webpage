import { Metadata } from "next";
import { PrismicNextImage } from "@prismicio/next";
import { asText } from "@prismicio/client";
import Link from "next/link";
import { createClient } from "@/prismicio";

export const metadata: Metadata = { title: "Lore" };

export default async function LorePage() {
  const client = createClient();
  const items = await client.getAllByType("lore_entry");

  // Group by category
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    const category = (item.data.category as string) || "other";
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-2 font-display text-5xl uppercase tracking-wide md:text-7xl">
        Worldbuilding
      </h1>
      <p className="mb-12 text-on-ink-mute">
        Explore the world of Heirs of the Collapse.
      </p>

      {Object.entries(groups).map(([category, entries]) => (
        <section key={category} className="mb-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">
            {category}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((item) => (
              <Link
                key={item.id}
                href={`/lore/${item.uid}`}
                className="group overflow-hidden rounded-sm border-2 border-ink bg-slate-900"
                style={{ boxShadow: "var(--hotc-shadow-panel-sm)" }}
              >
                {item.data.cover?.url ? (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <PrismicNextImage
                      field={item.data.cover}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                ) : null}
                <div className="p-4">
                  <h3 className="text-base font-bold">{item.data.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
