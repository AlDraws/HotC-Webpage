import { Metadata } from "next";
import { PrismicNextImage } from "@prismicio/next";
import { asText } from "@prismicio/client";
import Link from "next/link";
import { createClient } from "@/prismicio";

export const metadata: Metadata = { title: "Lore" };

export default async function LorePage() {
  const client = createClient();
  const items = await client.getAllByType("lore_item");

  // Group by kind
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    const kind = (item.data.kind as string) || "other";
    if (!groups[kind]) groups[kind] = [];
    groups[kind].push(item);
  }

  const kindLabels: Record<string, string> = {
    environment: "Environments",
    prop: "Props & Objects",
    illustration: "Illustrations",
    other: "Other",
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-2 font-display text-5xl uppercase tracking-wide md:text-7xl">
        Worldbuilding
      </h1>
      <p className="mb-12 text-on-ink-mute">
        Explore the world of Heirs of the Collapse.
      </p>

      {Object.entries(groups).map(([kind, entries]) => (
        <section key={kind} className="mb-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">
            {kindLabels[kind] ?? kind}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((item) => (
              <Link
                key={item.id}
                href={`/lore/${item.uid}`}
                className="group overflow-hidden rounded-sm border-2 border-ink bg-slate-900"
                style={{ boxShadow: "var(--hotc-shadow-panel-sm)" }}
              >
                {item.data.portrait?.url ? (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <PrismicNextImage
                      field={item.data.portrait}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                ) : null}
                <div className="p-4">
                  {item.data.role ? (
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-on-ink-faint">
                      {item.data.role}
                    </p>
                  ) : null}
                  <h3 className="text-base font-bold">{asText(item.data.name)}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
