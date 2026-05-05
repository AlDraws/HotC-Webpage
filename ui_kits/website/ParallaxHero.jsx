/* useParallax — devuelve un offset Y (px) en función del scroll del viewport
   relativo al elemento ref. Respeta prefers-reduced-motion. */
function useParallax(ref, strength = 0.25) {
  const [offset, setOffset] = React.useState(0);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      const el = ref.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // 0 cuando el centro del el está en el centro del viewport
      const center = rect.top + rect.height / 2 - vh / 2;
      setOffset(-center * strength);
    };
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; tick(); }); };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [ref, strength]);
  return offset;
}
window.useParallax = useParallax;

/* ParallaxHero — fondo (imagen o video) + overlay + foreground con parallax independiente.
   Props:
     bgImage, bgVideo (mp4), bgPoster
     foreground (img src) opcional — capa intermedia con parallax mayor
     bgStrength (default 0.18), fgStrength (default 0.4)
     kicker, title, subtitle, primaryCta, secondaryCta, onCtaClick
     size: 'md' | 'lg' (alto del hero)
*/
function ParallaxHero({ bgImage, bgVideo, bgPoster, foreground, bgStrength = 0.18, fgStrength = 0.42, kicker, title, subtitle, primaryCta, secondaryCta, onCtaClick, size = "lg", overlay = "strong" }) {
  const ref = React.useRef(null);
  const offsetBg = useParallax(ref, bgStrength);
  const offsetFg = useParallax(ref, fgStrength);
  return (
    <section ref={ref} className={"hotc-hero hotc-phero hotc-hero--" + size}>
      <div className="hotc-phero__bg" style={{ transform: `translate3d(0, ${offsetBg}px, 0) scale(1.18)` }}>
        {bgVideo ? (
          <video className="hotc-phero__video" src={bgVideo} poster={bgPoster || bgImage} autoPlay muted loop playsInline />
        ) : (
          <div className="hotc-phero__img" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
      </div>
      <div className={"hotc-hero__overlay hotc-overlay--" + overlay}/>
      {foreground && (
        <div className="hotc-phero__fg" style={{ transform: `translate3d(0, ${offsetFg}px, 0)` }}>
          <img src={foreground} alt=""/>
        </div>
      )}
      <div className="bounded hotc-hero__inner hotc-phero__inner">
        {kicker && <span className="hotc-kicker hotc-hero__kicker">{kicker}</span>}
        <h1 className="hotc-hero__title">{title}</h1>
        {subtitle && <p className="hotc-hero__subtitle">{subtitle}</p>}
        {(primaryCta || secondaryCta) && (
          <div className="hotc-hero__ctas">
            {primaryCta && <button className="hotc-btn hotc-btn--ember" onClick={() => onCtaClick && onCtaClick(primaryCta.target)}>{primaryCta.label}</button>}
            {secondaryCta && <button className="hotc-btn hotc-btn--ghost" style={{color:"#fff"}} onClick={() => onCtaClick && onCtaClick(secondaryCta.target)}>{secondaryCta.label}</button>}
          </div>
        )}
      </div>
    </section>
  );
}
window.ParallaxHero = ParallaxHero;
