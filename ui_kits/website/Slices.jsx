/* Slices Prismic adicionales — modulares y listos para mapear desde slice models */

function Callout({ variant = "default", title, body }) {
  return (
    <aside className={"hotc-callout hotc-callout--" + variant}>
      <div className="hotc-callout__bar" aria-hidden></div>
      <div className="hotc-callout__body">
        {title && <h4>{title}</h4>}
        <p>{body}</p>
      </div>
    </aside>
  );
}

function Quote({ text, source }) {
  return (
    <section className="hotc-quote">
      <p className="hotc-quote__text">&ldquo;{text}&rdquo;</p>
      {source && <span className="hotc-quote__source">{source}</span>}
    </section>
  );
}

function CtaBlock({ title, body, cta, onCtaClick }) {
  return (
    <section className="bounded">
      <div className="hotc-cta-block">
        <h2>{title}</h2>
        {body && <p>{body}</p>}
        {cta && <button className="hotc-btn hotc-btn--ink" onClick={() => onCtaClick && onCtaClick(cta.target)}>{cta.label}</button>}
      </div>
    </section>
  );
}

function NewsletterEmbed({ title = "Sundays in your inbox.", body = "One email when a new chapter drops. No spam, no autoplay, no algorithm.", placeholder = "your@email.com", ctaLabel = "Subscribe" }) {
  return (
    <section className="bounded">
      <div className="hotc-newsletter">
        <h3>{title}</h3>
        <p>{body}</p>
        <form className="hotc-newsletter__form" onSubmit={(e)=>e.preventDefault()}>
          <input type="email" placeholder={placeholder} />
          <button className="hotc-btn hotc-btn--ember" type="submit">{ctaLabel}</button>
        </form>
      </div>
    </section>
  );
}

function Gallery({ images = [] }) {
  return (
    <section className="bounded bounded--base">
      <div className="hotc-gallery">
        {images.map((src, i) => (
          <div key={i} className="hotc-gallery__tile" style={{ backgroundImage: `url(${src})` }} />
        ))}
      </div>
    </section>
  );
}

function ImageCards({ kicker, title, cards = [] }) {
  return (
    <section className="bounded bounded--base">
      {(kicker || title) && (
        <div className="hotc-cgrid__head">
          {kicker && <span className="hotc-kicker">{kicker}</span>}
          {title && <h2>{title}</h2>}
        </div>
      )}
      <div className="hotc-icards">
        {cards.map((c, i) => (
          <article key={i} className="hotc-icard">
            <div className="hotc-icard__img" style={{ backgroundImage: `url(${c.image})` }} />
            {c.title && <h3 className="hotc-icard__title">{c.title}</h3>}
            {c.caption && <p className="hotc-icard__caption">{c.caption}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function FeatureGrid({ kicker, title, features = [] }) {
  return (
    <section className="bounded bounded--base">
      {(kicker || title) && (
        <div className="hotc-cgrid__head">
          {kicker && <span className="hotc-kicker">{kicker}</span>}
          {title && <h2>{title}</h2>}
        </div>
      )}
      <div className="hotc-fgrid">
        {features.map((f, i) => (
          <article key={i} className="hotc-fcard">
            <div className="hotc-fcard__icon">{f.glyph || "★"}</div>
            <h4>{f.title}</h4>
            <p>{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ImageFull({ image, alt = "" }) {
  return (
    <figure className="hotc-image-full">
      <img src={image} alt={alt} loading="lazy" />
    </figure>
  );
}

function LoreSection({ title, body, image }) {
  return (
    <section className="hotc-lore">
      <div className="hotc-lore__inner">
        <div>
          <h2>{title}</h2>
          <p style={{marginTop: "1rem"}}>{body}</p>
        </div>
        {image && <img src={image} alt="" loading="lazy"/>}
      </div>
    </section>
  );
}

window.Callout = Callout;
window.Quote = Quote;
window.CtaBlock = CtaBlock;
window.NewsletterEmbed = NewsletterEmbed;
window.Gallery = Gallery;
window.ImageCards = ImageCards;
window.FeatureGrid = FeatureGrid;
window.ImageFull = ImageFull;
window.LoreSection = LoreSection;
