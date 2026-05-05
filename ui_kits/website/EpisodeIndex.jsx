/* EpisodeIndex — i18n */
function EpisodeIndex({ episodes = [], onSelect, t }) {
  const tt = t || (k => k);
  return (
    <>
      <section className="bounded hotc-page__head">
        <span className="hotc-kicker">{tt("kicker") || "Archive"}</span>
        <h1 className="hotc-h1">{tt("title") || "Episodes"}</h1>
        <p className="hotc-page__intro">{tt("intro") || ""}</p>
      </section>
      <section className="bounded bounded--base" style={{paddingTop: 0}}>
        <div className="hotc-eidx__grid">
          {episodes.map(ep => (
            <button key={ep.slug} className="hotc-ep-card" onClick={() => onSelect && onSelect(ep.slug)}>
              <div className="hotc-ep-card__cover" style={{ backgroundImage: `url(${ep.cover})` }}>
                {ep.isNew && <span className="hotc-ep-card__badge">{tt("new") || "New"}</span>}
              </div>
              <div>
                <span className="hotc-ep-card__date">{tt("chapter") || "CH."} {ep.number} · {ep.publishedOn}</span>
                <h3 className="hotc-ep-card__title">{ep.title}</h3>
                <p className="hotc-ep-card__synopsis">{ep.synopsis}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
window.EpisodeIndex = EpisodeIndex;
