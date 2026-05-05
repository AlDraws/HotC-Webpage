/* Worldbuilding — Environments / Props / Illustrations grids + LoreEntry profile */
function ItemGrid({ kicker, title, items = [], onSelect, columns = "auto" }) {
  return (
    <section className="bounded bounded--base" style={{paddingTop: "1.5rem"}}>
      {(kicker || title) && (
        <div className="hotc-cgrid__head">
          {kicker && <span className="hotc-kicker">{kicker}</span>}
          {title && <h2 className="hotc-h2">{title}</h2>}
        </div>
      )}
      <div className={"hotc-cgrid__grid" + (columns === "wide" ? " hotc-cgrid__grid--wide" : "")}>
        {items.map(it => (
          <button key={it.slug} className="hotc-cgrid__cell" onClick={() => onSelect && onSelect(it.slug)}>
            <div className="hotc-cgrid__portrait" style={{ backgroundImage: `url(${it.portrait || it.image})`, aspectRatio: it.aspect || undefined }} />
            <div className="hotc-cgrid__meta">
              {it.role && <span className="hotc-cgrid__role">{it.role}</span>}
              <span className="hotc-cgrid__name">{it.name || it.title}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
window.ItemGrid = ItemGrid;

/* Worldbuilding hub: 3 secciones tipo grid */
function WorldbuildingHub({ data, onSelect, t }) {
  return (
    <>
      <section className="bounded hotc-page__head">
        <span className="hotc-kicker">{t("kicker")}</span>
        <h1 className="hotc-h1">{t("title")}</h1>
        <p className="hotc-page__intro">{t("intro")}</p>
      </section>
      <ItemGrid kicker="01" title={t("environments")} items={data.environments || []} onSelect={(s) => onSelect("environment", s)} />
      <ItemGrid kicker="02" title={t("props")} items={data.props || []} onSelect={(s) => onSelect("prop", s)} />
      <ItemGrid kicker="03" title={t("illustrations")} items={data.illustrations || []} onSelect={(s) => onSelect("illustration", s)} columns="wide"/>
    </>
  );
}
window.WorldbuildingHub = WorldbuildingHub;

/* LoreProfile — perfil genérico para Environment/Prop/Illustration */
function LoreProfile({ item, onBack, t }) {
  const it = item;
  const ref = React.useRef(null);
  const offBg = useParallax(ref, 0.18);
  return (
    <article>
      <section ref={ref} className="hotc-cprofile__hero">
        <div className="hotc-cprofile__bg" style={{ backgroundImage: `url(${it.cover || it.image})`, transform: `translate3d(0, ${offBg}px, 0) scale(1.15)` }}/>
        <div className="hotc-cprofile__overlay"/>
        <div className="bounded hotc-cprofile__hero-inner">
          <button className="hotc-cprofile__back" onClick={onBack}>← {t || "Worldbuilding"}</button>
          <span className="hotc-kicker" style={{color: "var(--hotc-ember)"}}>{it.kind}</span>
          <h1 className="hotc-cprofile__name">{it.name || it.title}</h1>
          {it.epithet && <p className="hotc-cprofile__epithet">{it.epithet}</p>}
        </div>
      </section>
      {it.body && (
        <section className="bounded bounded--base">
          <div className="hotc-cprofile__bio">
            {it.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>
      )}
      {it.gallery && it.gallery.length > 0 && (
        <section className="bounded bounded--base" style={{paddingTop: 0}}>
          <div className="hotc-cprofile__gallery-grid">
            {it.gallery.map((g, i) => <div key={i} className="hotc-cprofile__gallery-tile" style={{ backgroundImage: `url(${g})` }}/>)}
          </div>
        </section>
      )}
    </article>
  );
}
window.LoreProfile = LoreProfile;
