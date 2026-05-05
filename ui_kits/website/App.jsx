/* App — i18n, parallax hero, worldbuilding hub, store, character profile parallax */
function App() {
  const data = window.HOTC_SAMPLE;
  const [lang, setLangState] = React.useState(() => window.hotcDetectLang());
  const setLang = (l) => { setLangState(l); window.hotcSaveLang(l); };
  const dict = window.HOTC_I18N[lang];
  const tt = (group) => (key) => (dict && dict[group] && dict[group][key]) || key;

  const [route, setRoute] = React.useState({ page: "home" });
  const navigate = (page, params = {}) => {
    setRoute({ page, ...params });
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const onCtaClick = (target) => {
    if (target === "latest") {
      const latest = data.episodes[0];
      navigate("reader", { slug: latest.slug });
    } else navigate(target);
  };

  let content = null;

  if (route.page === "home") {
    content = (
      <>
        <ParallaxHero
          bgImage={data.hero.bgImage}
          bgVideo={data.hero.bgVideo}
          foreground={data.hero.foreground}
          kicker={lang === "es" ? data.hero.kicker_es : data.hero.kicker_en}
          title={dict.home.title}
          subtitle={dict.home.subtitle}
          primaryCta={{ label: dict.cta.readLatest, target: "latest" }}
          secondaryCta={{ label: dict.cta.browseArchive, target: "episodes" }}
          onCtaClick={onCtaClick}
          size="lg"
        />
        <ImageTicker images={data.ticker} speed={45} />
        <TextWithImage
          kicker={dict.lore.kicker}
          title={dict.lore.title}
          body={dict.lore.intro}
          image="../../assets/comic-panel-placeholder.svg"
          cta={{ label: dict.cta.readWorldbuilding, target: "lore" }}
          onCtaClick={onCtaClick}
        />
        <TextWithImage
          reverse
          kicker={dict.characters.kicker}
          title={dict.characters.title}
          body={dict.characters.intro}
          image="../../assets/character-portrait-placeholder.svg"
          cta={{ label: dict.cta.meetCast, target: "characters" }}
          onCtaClick={onCtaClick}
        />
        <ItemGrid kicker={dict.characters.kicker} title={dict.characters.featured}
                  items={data.characters} onSelect={(slug) => navigate("character", { slug })}/>
      </>
    );
  } else if (route.page === "episodes") {
    content = <EpisodeIndex episodes={data.episodes} t={tt("episodes")} onSelect={(slug) => navigate("reader", { slug })}/>;
  } else if (route.page === "reader") {
    const idx = data.episodes.findIndex(e => e.slug === route.slug);
    const ep = data.episodes[idx];
    if (!ep) {
      content = <section className="bounded bounded--base"><p>Chapter not found.</p></section>;
    } else {
      content = (
        <EpisodeSequence
          episode={{...ep, prev: data.episodes[idx + 1], next: data.episodes[idx - 1]}}
          onPrev={() => data.episodes[idx + 1] && navigate("reader", { slug: data.episodes[idx + 1].slug })}
          onNext={() => data.episodes[idx - 1] && navigate("reader", { slug: data.episodes[idx - 1].slug })}
          onBack={() => navigate("episodes")}
          t={tt("reader")}
        />
      );
    }
  } else if (route.page === "characters") {
    content = (
      <>
        <section className="bounded hotc-page__head">
          <span className="hotc-kicker">{dict.characters.kicker}</span>
          <h1 className="hotc-h1">{dict.characters.title}</h1>
          <p className="hotc-page__intro">{dict.characters.intro}</p>
        </section>
        <ItemGrid items={data.characters} onSelect={(slug) => navigate("character", { slug })}/>
      </>
    );
  } else if (route.page === "character") {
    const c = data.characters.find(x => x.slug === route.slug);
    content = c
      ? <CharacterProfile character={c} onBack={() => navigate("characters")} t={tt("characters")} />
      : <section className="bounded bounded--base"><p>Character not found.</p></section>;
  } else if (route.page === "lore") {
    content = <WorldbuildingHub data={data.worldbuilding} t={tt("lore")}
                                onSelect={(kind, slug) => navigate("lore-item", { kind, slug })}/>;
  } else if (route.page === "lore-item") {
    const list = data.worldbuilding[route.kind + "s"] || [];
    const it = list.find(x => x.slug === route.slug);
    content = it
      ? <LoreProfile item={it} onBack={() => navigate("lore")} t={dict.lore.title}/>
      : <section className="bounded bounded--base"><p>Not found.</p></section>;
  } else if (route.page === "store") {
    content = <Store products={data.store} t={(k) => (dict.store[k] || dict.cta[k] || k)} onBuy={() => {}} />;
  } else if (route.page === "about") {
    content = (
      <>
        <section className="bounded hotc-page__head">
          <span className="hotc-kicker">{dict.about.kicker}</span>
          <h1 className="hotc-h1">{dict.about.title}</h1>
          <p className="hotc-page__intro">{dict.about.intro}</p>
        </section>
      </>
    );
  }

  return (
    <>
      <Header active={route.page} onNavigate={navigate} lang={lang} setLang={setLang} t={tt("nav")} />
      <main>{content}</main>
      <Footer onNavigate={navigate} lang={lang} t={tt("footer")} />
    </>
  );
}
window.App = App;
