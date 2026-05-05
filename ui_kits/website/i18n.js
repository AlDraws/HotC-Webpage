/* i18n — diccionario simple ES/EN. En producción, mover a Prismic settings + localized fields. */
const HOTC_I18N = {
  en: {
    nav: { episodes: "Episodes", characters: "Characters", worldbuilding: "Worldbuilding", store: "Store", about: "About" },
    cta: { readLatest: "Read latest chapter", browseArchive: "Browse archive", readWorldbuilding: "Read worldbuilding", meetCast: "Meet the cast", subscribe: "Subscribe", buy: "Buy", outOfStock: "Out of stock" },
    home: { kicker: "Updates Sundays", title: "An anthology of what comes after the gods.", subtitle: "Heirs of the Collapse follows the descendants of a fallen pantheon, scraping life from the rubble their ancestors left behind." },
    characters: { kicker: "The cast", title: "Characters", intro: "Heirs, archivists, lantern-keepers, cartographers. Each carries a piece of what was, and a guess at what comes next.", featured: "Recent appearances.", back: "← Cast" },
    episodes:  { kicker: "Archive", title: "Episodes", intro: "Read straight through, or pick a chapter. Updates Sundays.", new: "New", chapter: "CH." },
    reader:    { back: "← All chapters", prev: "← Previous", next: "Next →", end: "End of chapter" },
    lore:      { kicker: "Worldbuilding", title: "The shape of the Collapse.", intro: "Reference essays, environments, props and illustrations. Updated as the comic reveals more.", environments: "Environments", props: "Props", illustrations: "Illustrations" },
    store:     { kicker: "Store", title: "Bring it home.", intro: "Print volumes, art prints, and small runs of apparel. Shipped from the studio every other Friday." },
    about:     { kicker: "About", title: "Who's making this.", intro: "Heirs of the Collapse is written and drawn by Álvaro Serrano Sierra. Updates Sundays, in long-strip format, free to read." },
    footer:    { tag: "A serialized webcomic by Álvaro Serrano Sierra. Published Sundays.", read: "Read", more: "More", follow: "Follow", siteBy: "site by", rights: "© 2026 Álvaro Serrano Sierra · Heirs of the Collapse · All rights reserved." },
    newsletter:{ title: "Sundays in your inbox.", body: "One email when a new chapter drops. No spam, no autoplay, no algorithm.", placeholder: "your@email.com" },
  },
  es: {
    nav: { episodes: "Capítulos", characters: "Personajes", worldbuilding: "Universo", store: "Tienda", about: "Sobre el cómic" },
    cta: { readLatest: "Leer último capítulo", browseArchive: "Ver archivo", readWorldbuilding: "Explorar universo", meetCast: "Conocer al elenco", subscribe: "Suscribirse", buy: "Comprar", outOfStock: "Agotado" },
    home: { kicker: "Domingos · Capítulo nuevo", title: "Una antología sobre lo que viene tras los dioses.", subtitle: "Heirs of the Collapse sigue a los descendientes de un panteón caído, arrancando vida de los escombros que dejaron sus ancestros." },
    characters: { kicker: "El elenco", title: "Personajes", intro: "Herederos, archivistas, faroleros, cartógrafos. Cada uno carga un fragmento de lo que fue y una sospecha de lo que viene.", featured: "Apariciones recientes.", back: "← Elenco" },
    episodes:  { kicker: "Archivo", title: "Capítulos", intro: "Léelo de seguido o salta a un capítulo. Se publica los domingos.", new: "Nuevo", chapter: "CAP." },
    reader:    { back: "← Todos los capítulos", prev: "← Anterior", next: "Siguiente →", end: "Fin del capítulo" },
    lore:      { kicker: "Universo", title: "La forma del Colapso.", intro: "Ensayos de referencia, entornos, props e ilustraciones. Se amplía conforme el cómic avanza.", environments: "Entornos", props: "Props", illustrations: "Ilustraciones" },
    store:     { kicker: "Tienda", title: "Llévatelo a casa.", intro: "Tomos impresos, prints y pequeñas tiradas de ropa. Envíos desde el estudio cada dos viernes." },
    about:     { kicker: "Sobre el cómic", title: "Quién está detrás.", intro: "Heirs of the Collapse está escrito y dibujado por Álvaro Serrano Sierra. Se publica los domingos en formato webtoon, gratis." },
    footer:    { tag: "Un webcómic serializado de Álvaro Serrano Sierra. Publicado los domingos.", read: "Leer", more: "Más", follow: "Seguir", siteBy: "sitio de", rights: "© 2026 Álvaro Serrano Sierra · Heirs of the Collapse · Todos los derechos reservados." },
    newsletter:{ title: "Domingos en tu bandeja.", body: "Un email cuando salga capítulo nuevo. Sin spam, sin autoplay, sin algoritmo.", placeholder: "tu@email.com" },
  },
};

const HOTC_LANG_KEY = "hotc.lang";
function hotcDetectLang() {
  try {
    const saved = localStorage.getItem(HOTC_LANG_KEY);
    if (saved && HOTC_I18N[saved]) return saved;
  } catch (e) {}
  const nav = (typeof navigator !== "undefined" && navigator.language || "en").toLowerCase();
  return nav.startsWith("es") ? "es" : "en";
}
function hotcSaveLang(lang) { try { localStorage.setItem(HOTC_LANG_KEY, lang); } catch(e){} }

window.HOTC_I18N = HOTC_I18N;
window.hotcDetectLang = hotcDetectLang;
window.hotcSaveLang = hotcSaveLang;
