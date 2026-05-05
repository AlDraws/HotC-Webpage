/* TextWithImage — bloque editorial mobile-first */
function TextWithImage({ kicker, title, body, image, reverse, cta, onCtaClick }) {
  return (
    <section className={"bounded hotc-twi" + (reverse ? " hotc-twi--reverse" : "")}>
      <div className="hotc-twi__inner">
        <div className="hotc-twi__media">
          <img className="hotc-twi__img" src={image} alt="" loading="lazy"/>
        </div>
        <div className="hotc-twi__copy">
          {kicker && <span className="hotc-kicker">{kicker}</span>}
          <h2 className="hotc-h2">{title}</h2>
          <p className="hotc-twi__body">{body}</p>
          {cta && <button className="hotc-btn hotc-btn--ink" onClick={() => onCtaClick && onCtaClick(cta.target)}>{cta.label}</button>}
        </div>
      </div>
    </section>
  );
}
window.TextWithImage = TextWithImage;
