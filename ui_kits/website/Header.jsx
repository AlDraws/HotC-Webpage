/* Header — sticky con burger móvil + i18n switcher + socials Instagram/TikTok/Webtoon */
function Header({ active, onNavigate, lang, setLang, t }) {
  const [open, setOpen] = React.useState(false);
  const tr = t || (k => k);
  const nav = [
    { label: tr("episodes"),     route: "episodes" },
    { label: tr("characters"),   route: "characters" },
    { label: tr("worldbuilding"),route: "lore" },
    { label: tr("store"),        route: "store" },
    { label: tr("about"),        route: "about" },
  ];
  const go = (r) => { onNavigate && onNavigate(r); setOpen(false); };
  const Socials = () => (
    <div className="hotc-header__socials">
      <a className="hotc-header__icon" href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
      </a>
      <a className="hotc-header__icon" href="https://tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 7.6a6.6 6.6 0 0 1-3.9-1.3v8.5a5.7 5.7 0 1 1-5-5.7v2.8a3 3 0 1 0 2.2 2.9V2.5h2.7a4 4 0 0 0 4 4z"/></svg>
      </a>
      <a className="hotc-header__icon" href="https://www.webtoons.com/en/canvas" target="_blank" rel="noopener noreferrer" aria-label="Webtoon Canvas">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M7 9l2 6 3-8 3 8 2-6"/></svg>
      </a>
    </div>
  );
  const LangSwitch = () => (
    <div className="hotc-header__lang" role="group" aria-label="Language">
      <button className={lang === "en" ? "is-active" : ""} onClick={() => setLang("en")}>EN</button>
      <button className={lang === "es" ? "is-active" : ""} onClick={() => setLang("es")}>ES</button>
    </div>
  );
  return (
    <header className="hotc-header">
      <div className="bounded hotc-header__inner">
        <a className="hotc-header__logo" onClick={() => go("home")} aria-label="Heirs of the Collapse">
          <span className="hotc-logo-mask hotc-logo-mask--heirs"></span>
        </a>
        <nav className="hotc-header__nav">
          {nav.map(n => (
            <a key={n.route}
               className={"hotc-header__nav-item" + (active === n.route ? " is-active" : "")}
               onClick={() => go(n.route)}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hotc-header__actions">
          <LangSwitch/>
          <Socials/>
          <button className="hotc-header__burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="hotc-header__drawer" role="dialog" aria-modal="true">
          <div className="hotc-header__drawer-head">
            <a className="hotc-header__logo" onClick={() => go("home")}><span className="hotc-logo-mask hotc-logo-mask--heirs"></span></a>
            <button className="hotc-header__burger" aria-label="Close" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
          <nav className="hotc-header__drawer-nav">
            {nav.map(n => (
              <a key={n.route} className={active === n.route ? "is-active" : ""} onClick={() => go(n.route)}>
                <span>{n.label}</span><span aria-hidden>→</span>
              </a>
            ))}
          </nav>
          <div className="hotc-header__drawer-foot">
            <LangSwitch/>
            <Socials/>
          </div>
        </div>
      )}
    </header>
  );
}
window.Header = Header;
