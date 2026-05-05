/* Footer — atribución a Álvaro Serrano Sierra. Socials: Instagram, TikTok, Webtoon. */
function Footer({ onNavigate, t, lang }) {
  const tr = t || (k => k);
  const cols = [
    { title: tr("read") || "Read", links: [
      { label: (lang === "es" ? "Capítulos" : "Episodes"), route: "episodes" },
      { label: (lang === "es" ? "Personajes" : "Characters"), route: "characters" },
      { label: (lang === "es" ? "Universo"   : "Worldbuilding"), route: "lore" },
    ]},
    { title: tr("more") || "More", links: [
      { label: (lang === "es" ? "Tienda" : "Store"), route: "store" },
      { label: (lang === "es" ? "Sobre el cómic" : "About"), route: "about" },
      { label: (lang === "es" ? "Newsletter" : "Newsletter"), href: "#newsletter" },
    ]},
    { title: tr("follow") || "Follow", links: [
      { label: "Instagram", href: "https://instagram.com/", external: true },
      { label: "TikTok",    href: "https://tiktok.com/",    external: true },
      { label: "Webtoon Canvas", href: "https://www.webtoons.com/en/canvas", external: true },
    ]},
  ];
  return (
    <footer className="hotc-footer">
      <div className="bounded hotc-footer__inner">
        <div className="hotc-footer__brand">
          <a className="hotc-footer__logo" onClick={() => onNavigate("home")}>
            <span className="hotc-logo-mask hotc-logo-mask--heirs"></span>
          </a>
          <p className="hotc-footer__tag">{tr("tag")}</p>
        </div>
        <div className="hotc-footer__cols">
          {cols.map((c, i) => (
            <div key={i} className="hotc-footer__col">
              <h4>{c.title}</h4>
              {c.links.map((l, j) => (
                <a key={j}
                   onClick={l.route ? () => onNavigate(l.route) : undefined}
                   href={l.href}
                   target={l.external ? "_blank" : undefined}
                   rel={l.external ? "noopener noreferrer" : undefined}>
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="bounded hotc-footer__base">
        <a href="https://www.alvaro-serrano.com" target="_blank" rel="noopener noreferrer" style={{cursor:"pointer"}}>
          {tr("rights")}
        </a>
        <a className="hotc-footer__attr"
           href="https://www.alvaro-serrano.com"
           target="_blank" rel="noopener noreferrer"
           aria-label="Álvaro Serrano Sierra — alvaro-serrano.com">
          <span className="hotc-footer__attr-by">{tr("siteBy")}</span>
          <span className="hotc-logo-mask hotc-logo-mask--alvaro"></span>
        </a>
      </div>
    </footer>
  );
}
window.Footer = Footer;
