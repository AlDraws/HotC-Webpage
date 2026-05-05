/* EpisodeSequence — secuencia de páginas verticales sin costuras (max 1080px) */
function EpisodeSequence({ episode, onPrev, onNext, onBack, t }) {
  const tt = t || (k => k);
  const ep = episode;
  return (
    <article className="hotc-seq">
      <header className="hotc-seq__head bounded">
        <button className="hotc-cprofile__back" onClick={onBack} style={{padding:0, color:"var(--hotc-on-ink-mute)"}}>{tt("back") || "← All chapters"}</button>
        <span className="hotc-kicker" style={{color:"var(--hotc-ember)"}}>Chapter {ep.number} · {ep.publishedOn}</span>
        <h1 className="hotc-seq__title">{ep.title}</h1>
        {ep.synopsis && <p className="hotc-seq__tagline">{ep.synopsis}</p>}
      </header>
      <div className="hotc-seq__pages">
        {ep.pages.map((p, i) => (
          <figure key={i} className="hotc-seq__page">
            <img src={p.src} alt={p.alt || `Page ${i+1}`} loading={i < 2 ? "eager" : "lazy"} width={p.width || 1080} height={p.height || 1620}/>
          </figure>
        ))}
      </div>
      <nav className="hotc-seq__nav">
        <button className="hotc-btn hotc-btn--ghost" style={{color:"#fff", borderColor:"#fff"}} onClick={onPrev} disabled={!ep.prev}>{tt("prev") || "← Previous"}</button>
        <span className="hotc-seq__nav-meta">{tt("end") || "End of Chapter"} {ep.number}</span>
        <button className="hotc-btn hotc-btn--ember" onClick={onNext} disabled={!ep.next}>{tt("next") || "Next →"}</button>
      </nav>
    </article>
  );
}
window.EpisodeSequence = EpisodeSequence;
