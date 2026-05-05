import { Metadata } from "next";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { asText } from "@prismicio/client";
import { createClient } from "@/prismicio";

export const metadata: Metadata = { title: "Store" };

export default async function StorePage() {
  const client = createClient();
  const products: any[] = [];

  // Group by category
  const groups: Record<string, typeof products> = {};
  for (const p of products) {
    const cat = p.data.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-2 font-display text-5xl uppercase tracking-wide md:text-7xl">
        Store
      </h1>
      <p className="mb-12 text-on-ink-mute">Support the project.</p>

      {Object.entries(groups).map(([cat, items]) => (
        <section key={cat} className="mb-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">{cat}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-sm border-2 border-ink bg-slate-900"
                style={{ boxShadow: "var(--hotc-shadow-panel-sm)" }}
              >
                {p.data.image?.url ? (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <PrismicNextImage
                      field={p.data.image}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    {p.data.tag ? (
                      <span className="absolute left-3 top-3 rounded-sm bg-ember px-2 py-0.5 text-xs font-bold uppercase text-white">
                        {p.data.tag}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-4">
                  <PrismicRichText
                    field={p.data.title}
                    components={{
                      heading2: ({ children }) => (
                        <h3 className="text-lg font-bold leading-tight">{children}</h3>
                      ),
                    }}
                  />
                  {p.data.desc ? (
                    <div className="mt-2 line-clamp-3 text-sm text-on-ink-mute">
                      <PrismicRichText field={p.data.desc} />
                    </div>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-lg font-bold text-ember">
                      {p.data.price ?? "—"}
                    </span>
                    {p.data.outOfStock ? (
                      <span className="text-sm font-medium text-on-ink-faint">
                        Sold out
                      </span>
                    ) : p.data.buyUrl ? (
                      <PrismicNextLink
                        field={p.data.buyUrl}
                        className="rounded-sm border-2 border-ink bg-ember px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                        style={{ boxShadow: "var(--hotc-shadow-panel-sm)" }}
                      >
                        Buy
                      </PrismicNextLink>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
