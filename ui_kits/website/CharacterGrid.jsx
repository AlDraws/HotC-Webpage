/* CharacterGrid — grid responsive 2/3/4 cols */
function CharacterGrid({ kicker, title, characters = [], onSelect }) {
  return (
    <section className="bounded bounded--base">
      {(kicker || title) && (
        <div className="hotc-cgrid__head">
          {kicker && <span className="hotc-kicker">{kicker}</span>}
          {title && <h2 className="hotc-h2">{title}</h2>}
        </div>
      )}
      <div className="hotc-cgrid__grid">
        {characters.map(c => (
          <button key={c.slug} className="hotc-cgrid__cell" onClick={() => onSelect && onSelect(c.slug)}>
            <div className="hotc-cgrid__portrait" style={{ backgroundImage: `url(${c.portrait})` }} />
            <div className="hotc-cgrid__meta">
              <span className="hotc-cgrid__role">{c.role}</span>
              <span className="hotc-cgrid__name">{c.name}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
window.CharacterGrid = CharacterGrid;
