/* Hero — keyart full-bleed, título Bangers con outline+sombra dura */
function Hero({ kicker, title, subtitle, image, overlay = "strong", size = "lg", primaryCta, secondaryCta, onCtaClick }) {
  return (
    <section className={"hotc-hero hotc-hero--" + size}>
      {image && <div className="hotc-hero__bg" style={{ backgroundImage: `url(${image})` }} />}
      <div className="hotc-hero__overlay"/>
      <div className="bounded hotc-hero__inner">
        {kicker && <span className="hotc-kicker hotc-hero__kicker">{kicker}</span>}
        <h1 className="hotc-hero__title">{title}</h1>
        {subtitle && <p className="hotc-hero__subtitle">{subtitle}</p>}
        {(primaryCta || secondaryCta) && (
          <div className="hotc-hero__ctas">
            {primaryCta && <button className="hotc-btn hotc-btn--ember" onClick={() => onCtaClick && onCtaClick(primaryCta.target)}>{primaryCta.label}</button>}
            {secondaryCta && <button className="hotc-btn hotc-btn--ghost" style={{color: "#fff"}} onClick={() => onCtaClick && onCtaClick(secondaryCta.target)}>{secondaryCta.label}</button>}
          </div>
        )}
      </div>
    </section>
  );
}
window.Hero = Hero;
