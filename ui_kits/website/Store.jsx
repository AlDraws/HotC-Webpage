/* Store — grid de productos estilo cómic */
function Store({ products = [], t, onBuy }) {
  return (
    <>
      <section className="bounded hotc-page__head">
        <span className="hotc-kicker">{t("kicker")}</span>
        <h1 className="hotc-h1">{t("title")}</h1>
        <p className="hotc-page__intro">{t("intro")}</p>
      </section>
      <section className="bounded bounded--base" style={{paddingTop: "1.5rem"}}>
        <div className="hotc-store__grid">
          {products.map(p => (
            <article key={p.slug} className="hotc-store__card">
              <div className="hotc-store__cover" style={{ backgroundImage: `url(${p.image})` }}>
                {p.tag && <span className="hotc-store__tag">{p.tag}</span>}
              </div>
              <div className="hotc-store__body">
                <span className="hotc-store__category">{p.category}</span>
                <h3 className="hotc-store__title">{p.title}</h3>
                <p className="hotc-store__desc">{p.desc}</p>
                <div className="hotc-store__row">
                  <span className="hotc-store__price">{p.price}</span>
                  <button className={"hotc-btn " + (p.outOfStock ? "hotc-btn--ghost" : "hotc-btn--ember")} disabled={p.outOfStock} onClick={() => onBuy && onBuy(p.slug)}>
                    {p.outOfStock ? t("outOfStock") || "Out of stock" : (t("buy") || "Buy")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
window.Store = Store;
