/* CharacterProfile con parallax — fondo (deep), portrait (mid), texto (foreground) */
function CharacterProfile({ character, onBack, t }) {
  const c = character;
  const heroRef = React.useRef(null);
  const offBg = useParallax(heroRef, 0.18);
  const offMid = useParallax(heroRef, 0.32);
  const offText = useParallax(heroRef, 0.06);
  const tt = t || (k => k);
  return (
    <article>
      <section ref={heroRef} className="hotc-cprofile__hero">
        <div className="hotc-cprofile__bg" style={{ backgroundImage: `url(${c.cover})`, transform: `translate3d(0, ${offBg}px, 0) scale(1.15)` }}/>
        <div className="hotc-cprofile__overlay"/>
        <div className="bounded hotc-cprofile__hero-inner" style={{ transform: `translate3d(0, ${offText}px, 0)` }}>
          <button className="hotc-cprofile__back" onClick={onBack}>{tt("back") || "← Cast"}</button>
          <div className="hotc-cprofile__hero-grid">
            <div className="hotc-cprofile__portrait-card" style={{ transform: `translate3d(0, ${offMid}px, 0)` }}>
              <img className="hotc-cprofile__portrait" src={c.portrait} alt={c.name}/>
            </div>
            <div className="hotc-cprofile__intro">
              <span className="hotc-kicker" style={{color: "var(--hotc-ember)"}}>{c.role}</span>
              <h1 className="hotc-cprofile__name">{c.name}</h1>
              <p className="hotc-cprofile__epithet">{c.epithet}</p>
              {c.attributes && c.attributes.length > 0 && (
                <div className="hotc-cprofile__attrs">
                  {c.attributes.map((a, i) => (
                    <div key={i} className="hotc-cprofile__attr">
                      <span className="hotc-attr-label">{a.label}</span>
                      <span className="hotc-cprofile__attr-value">{a.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="bounded bounded--base">
        <div className="hotc-cprofile__bio">
          <h3 className="hotc-h3">Bio</h3>
          {c.bio && c.bio.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>
      {c.gallery && c.gallery.length > 0 && (
        <section className="bounded bounded--base" style={{paddingTop: 0}}>
          <div className="hotc-cprofile__gallery">
            <h3 className="hotc-h3">Gallery</h3>
            <div className="hotc-cprofile__gallery-grid">
              {c.gallery.map((g, i) => <div key={i} className="hotc-cprofile__gallery-tile" style={{ backgroundImage: `url(${g})` }}/>)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
window.CharacterProfile = CharacterProfile;
