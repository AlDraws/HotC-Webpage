/* EpisodeReader — visualizador del cómic.
   Reglas:
   - Fondo cinema (slate-950)
   - Container max-width: 1080px (ancho de página del cómic)
   - Imágenes consecutivas dentro de una "page-run" SIN gap, SIN costuras
   - Cada secuencia (slice EpisodeSequence) puede tener N páginas; se renderiza como un único bloque continuo
   - Dividers solo ENTRE secuencias, nunca dentro
   - Lazy loading + width/height reservados → cero layout shift en móvil
   - Mobile-first: en móvil ocupa 100vw; en desktop tope 1080px
*/

function EpisodeTextBeat({ tone, text }) {
  return <div className={"hotc-tb hotc-tone-" + (tone || "neutral")}>{text}</div>;
}

function EpisodeDivider({ size = "md" }) {
  return (
    <div className={"hotc-ediv hotc-ediv--" + size}>
      <span className="hotc-ediv__line" />
      <span className="hotc-ediv__glyph">◆</span>
      <span className="hotc-ediv__line" />
    </div>
  );
}

/* Una página individual con dimensiones reservadas (1080 × height real)
   El alto real viene del campo Prismic (image.dimensions.height) o del
   `height` que el creador pase. */
function EpisodePage({ image, alt, width = 1080, height, isFirst }) {
  // Fallback height for placeholders
  const h = height || 1400;
  return (
    <img
      src={image}
      alt={alt || ""}
      width={width}
      height={h}
      loading={isFirst ? "eager" : "lazy"}
      decoding={isFirst ? "sync" : "async"}
      className="hotc-ep-page"
    />
  );
}

/* Secuencia de páginas: 1..N imágenes que deben sentirse como una sola.
   Sin gap, sin border-radius, sin sombras entre ellas. */
function EpisodeSequence({ pages, startIndex = 0 }) {
  return (
    <div className="hotc-ep-seq">
      {pages.map((p, i) => (
        <EpisodePage
          key={i}
          image={p.image}
          alt={p.alt}
          width={p.width || 1080}
          height={p.height}
          isFirst={startIndex === 0 && i === 0}
        />
      ))}
    </div>
  );
}

function EpisodeReader({ episode, onPrev, onNext, hasPrev, hasNext, onBack }) {
  let pageCounter = 0;

  return (
    <article className="hotc-ereader hotc--cinema">
      <div className="hotc-ereader__head">
        <button className="hotc-ereader__back" onClick={onBack}>← Archive</button>
        <span className="hotc-ereader__chapter">Chapter {episode.number}</span>
        <h1 className="hotc-ereader__title">{episode.title}</h1>
        <p className="hotc-ereader__date">
          {episode.publishedOn}{episode.pages ? ` · ${episode.pages} pages` : ""}
        </p>
      </div>

      <div className="hotc-ereader__strip">
        {episode.slices.map((s, i) => {
          if (s.type === "sequence") {
            const node = (
              <EpisodeSequence key={i} pages={s.pages} startIndex={pageCounter} />
            );
            pageCounter += s.pages.length;
            return node;
          }
          if (s.type === "panel") {
            // Backwards compat: panel suelto se trata como secuencia de 1
            const node = (
              <EpisodeSequence key={i} pages={[{
                image: s.image, alt: s.alt, height: s.height, width: s.width
              }]} startIndex={pageCounter} />
            );
            pageCounter += 1;
            return node;
          }
          if (s.type === "beat")    return <EpisodeTextBeat key={i} tone={s.tone} text={s.text} />;
          if (s.type === "divider") return <EpisodeDivider key={i} size={s.size} />;
          return null;
        })}
      </div>

      <nav className="hotc-ereader__nav">
        <div className="hotc-ereader__nav-inner">
          <button className="hotc-btn hotc-btn--ghost" disabled={!hasPrev} onClick={onPrev}>← Prev</button>
          <div className="hotc-ereader__progress">
            <span className="hotc-attr-label">CH. {episode.number}</span>
          </div>
          <button className="hotc-btn hotc-btn--ember" disabled={!hasNext} onClick={onNext}>Next →</button>
        </div>
      </nav>
    </article>
  );
}

window.EpisodeReader = EpisodeReader;
window.EpisodeSequence = EpisodeSequence;
window.EpisodePage = EpisodePage;
window.EpisodeTextBeat = EpisodeTextBeat;
window.EpisodeDivider = EpisodeDivider;
