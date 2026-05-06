import { Metadata } from "next";
import { PrismicRichText } from "@prismicio/react";
import { asText, type RichTextField } from "@prismicio/client";
import { createClient } from "@/prismicio";

export const metadata: Metadata = { title: "Store" };

type ProductDocument = {
  id: string;
  data: {
    category?: string | null;
    title: RichTextField;
    desc?: RichTextField | null;
    price?: string | null;
    image?: { url?: string | null } | null;
    tag?: string | null;
    outOfStock?: boolean | null;
    buyUrl?: { url?: string | null } | null;
  };
};

function getLinkHref(linkField: unknown): string | null {
  if (
    linkField &&
    typeof linkField === "object" &&
    "url" in linkField &&
    typeof (linkField as { url?: unknown }).url === "string" &&
    (linkField as { url: string }).url
  ) {
    return (linkField as { url: string }).url;
  }
  return null;
}

export default async function StorePage() {
  const client = createClient();
  const products = await client
    .getAllByType("product" as never)
    .then((result) => result as unknown as ProductDocument[])
    .catch(() => [] as ProductDocument[]);

  const groups: Record<string, typeof products> = {};
  for (const p of products) {
    const cat = p.data.category || "Store";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  }

  return (
    <>
      <section className="bounded hotc-page__head">
        <span className="hotc-kicker">Shop</span>
        <h1 className="hotc-h1">Store</h1>
        <p className="hotc-page__intro">Support the project.</p>
      </section>

      <section className="bounded bounded--base" style={{ paddingTop: "1.5rem" }}>
        {Object.entries(groups).map(([cat, items]) => (
          <section key={cat} className="mb-12">
            <div className="hotc-cgrid__head">
              <span className="hotc-kicker">{cat}</span>
            </div>
            <div className="hotc-store__grid">
              {items.map((p) => {
                const buyHref = getLinkHref(p.data.buyUrl);
                const clickable = !p.data.outOfStock && Boolean(buyHref);

                return (
                  <article key={p.id} className="hotc-store__card">
                    {clickable ? (
                      <a
                        href={buyHref || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Buy ${asText(p.data.title) || "product"}`}
                      >
                        <div
                          className="hotc-store__cover"
                          style={
                            p.data.image?.url
                              ? { backgroundImage: `url(${p.data.image.url})` }
                              : undefined
                          }
                        >
                          {p.data.tag ? (
                            <span className="hotc-store__tag">{p.data.tag}</span>
                          ) : null}
                        </div>
                      </a>
                    ) : (
                      <div className="hotc-store__cover">
                        {p.data.image?.url ? (
                          <img
                            src={p.data.image.url}
                            alt={asText(p.data.title) || "Product image"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                        {p.data.tag ? (
                          <span className="hotc-store__tag">{p.data.tag}</span>
                        ) : null}
                      </div>
                    )}

                    <div className="hotc-store__body">
                      {p.data.category ? (
                        <span className="hotc-store__category">{p.data.category}</span>
                      ) : null}
                      <PrismicRichText
                        field={p.data.title}
                        components={{
                          heading2: ({ children }) => (
                            <h3 className="hotc-store__title">{children}</h3>
                          ),
                        }}
                      />
                      {p.data.desc ? (
                        <div className="hotc-store__desc">
                          <PrismicRichText field={p.data.desc} />
                        </div>
                      ) : null}
                      <div className="hotc-store__row">
                        <span className="hotc-store__price">{p.data.price ?? "—"}</span>
                        {p.data.outOfStock ? (
                          <span className="hotc-btn hotc-btn--ghost">Sold out</span>
                        ) : buyHref ? (
                          <a
                            href={buyHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hotc-btn hotc-btn--ember"
                          >
                            Buy
                          </a>
                        ) : (
                          <span className="hotc-btn hotc-btn--ghost">Soon</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {!products.length ? (
          <div className="hotc-tb hotc-tone-neutral">
            <p>No products available yet.</p>
          </div>
        ) : null}
      </section>
    </>
  );
}
