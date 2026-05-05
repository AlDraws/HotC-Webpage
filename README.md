# Heirs of the Collapse — Design System

A design system for **Heirs of the Collapse** (HotC), a webcomic project. The website lets readers **read the comic, learn about its world & characters, and buy merchandise**.

## Sources

This system was reverse-engineered from the live site's codebase:

- **Codebase:** [`AlDraws/HotC-Webpage`](https://github.com/AlDraws/HotC-Webpage) — Next.js 15 + React 19 + Tailwind v4 + Prismic CMS
- **Adapter:** `@slicemachine/adapter-next`, repository `hotcwebpage`
- **Live demo (starter):** `nextjs-starter-prismic-multi-page.vercel.app` (the project is forked from this Prismic starter)

The codebase has heavy Spanish inline commenting — the creator/developer (AlDraws) appears to be a Spanish-speaking comic artist. Content authoring is done through Prismic.

## Index

| File | What it is |
|---|---|
| `colors_and_type.css` | CSS custom properties for color, type ramp, spacing, radii, shadows. Drop-in for any HotC artifact. |
| `fonts/` | Inter web font (used as `--font-sans` site-wide). |
| `assets/` | Logo placeholders, social-icon SVGs, generic comic-panel placeholders. |
| `preview/` | One HTML card per design-system concept. These populate the **Design System tab**. |
| `ui_kits/website/` | Pixel-fidelity recreation of the HotC website (homepage, episode reader, character grid, character profile, lore entry). |
| `SKILL.md` | Skill manifest — lets this system be invoked from Claude Code. |

## Product surface

A single product: **the HotC public website**, with these content types:

- **Home** — hero key art, featured episodes, image ticker rail, newsletter embed
- **Episodes index + episode reader** — scroll-to-read comic. Each episode is a sequence of `EpisodePanel` images interspersed with `EpisodeTextBeat` (whisper / dialogue / shout / sfx tones) and `EpisodeDivider` flourishes
- **Characters index + character profile** — portrait + bio + attributes + gallery, plus `CharacterGrid` rosters
- **Worldbuilding (lore)** — `LoreEntry` documents with cover, intro, and slices
- **Generic pages** — about, store, contact (uses the slice system freely)

## Content fundamentals

**Voice.** The site's job is to invite a reader into a world. Copy should be **evocative, present-tense, sparing**. Headers are short — often a single word or a 2–3 word phrase (the slice mocks are filled with placeholders like *"Steel"*, *"Pitch"*, *"Memory"*, *"Echoes"*). Body copy is conversational, second-person where it adds intimacy ("you").

**Casing.** Title Case for headings; UPPERCASE only for kickers (small eyebrow text above a hero) and attribute labels in character cards (`text-xs uppercase tracking-wide`). Sentence case for buttons and nav.

**Length.** Hero subtitles fit in one line at desktop. Episode synopses are 1–2 sentences. Lore entries can run longer — they're prose. Newsletter callouts are punchy: one promise, one CTA.

**Bilingual posture.** Site ships in English; codebase comments are Spanish. If localizing, plan for ~20% length growth from EN → ES.

**Tone words.** *Cinematic. Hand-drawn. Earned. Dim-lit. Patient.* Avoid: corporate, snappy, ironic, emoji-heavy.

**Emoji.** Not used. The brand doesn't reach for emoji as decoration; iconography is line-SVG or omitted.

**Examples (from slice mocks and content models):**
- Kicker → "valuable", "largest" — single evocative noun/adjective above a title
- Hero title → "Pitch", "Memory", "Steel" — one word
- Subtitle → one full sentence with a period
- CTA labels → "Learn More", "Read Episode", "Meet the Cast" — verb-led, sentence case
- Episode tones → `whisper` (italic, faint), `neutral` (regular), `shout` (bold, larger), `sfx` (display, expressive)
- Callout variants → `default`, `warning`, `lore` — the `lore` variant signals worldbuilding asides

## Visual foundations

**Mood.** Dark, cinematic, image-first. The base canvas is `slate-900` (`#0F172A`); body text drops to `slate-100` / `slate-200` against it. Light surfaces (`bg-white`) appear only inside specific slices like Quote, Text, TextWithImage — i.e. for prose breathers between dark image-heavy stretches.

**Color palette.**
- Ink (background): slate-900 `#0F172A`, slate-800 `#1E293B`, slate-950 `#020617`
- Foreground: white `#FFFFFF`, slate-100 `#F1F5F9`, slate-200 `#E2E8F0`
- Muted: slate-300 `#CBD5E1`, slate-400 `#94A3B8`, slate-500 `#64748B`
- Paper (light slices): white, slate-50 `#F8FAFC`, slate-100
- The codebase keeps semantic tones inside Tailwind's slate ramp — no brand chroma yet. This system **proposes a brand accent** (ember `#D97757`) for CTAs and link underlines, called out as a substitution to validate with the creator.

**Type.** Inter (`var(--font-inter)`), `display: swap`, latin subset, fallback to system stack. Heading tracking is **tight** (`tracking-tight`); leading is **tight** on heroes (`leading-tight md:leading-tight`). Sizes (from `Heading.tsx`):
- xl → `text-5xl md:text-7xl` (48 → 72px) — hero
- lg → `text-4xl md:text-5xl` (36 → 48px) — page title (default)
- md → `text-3xl md:text-4xl` (30 → 36px) — h2
- sm → `text-xl md:text-2xl` (20 → 24px) — h3
- All headings are `font-semibold`.
- Body uses Tailwind defaults (16px / 1.5).
- Kickers: `text-sm uppercase tracking-wide`.

**Spacing.** Tailwind defaults. Bounded container: `max-w-6xl` (1152px), `px-6` horizontal, vertical padding from `Bounded`'s `yPadding` prop: sm = `py-8 md:py-10`, base = `py-20 md:py-10`, lg = `py-32 md:py-48`. Hero sections use larger paddings (`py-16 md:py-24`).

**Backgrounds.** Heroes are **full-bleed images with parallax** via `useParallax` (strength 0.12, max 48px translation, with mouse pointer parallax up to 18×6, scaled 1.18 for safe edges, disabled below 768px viewport). Overlays available: `none`, `soft` (`bg-black/40`), `strong` (`bg-black/70`). When no image: solid `bg-slate-900`. The image-ticker marquee provides another full-bleed motion device — a horizontal scroll of square images that drag-scrolls and pauses on hover.

**Animation.** Honest, restrained. The marquee uses linear infinite translation driven by CSS variables (`--marquee-start`, `--marquee-end`, `--marquee-speed`). Parallax is transform-based, with pointer easing. The site **respects `prefers-reduced-motion: reduce`** (marquee disables, transforms reset). No bouncy springs. Default duration: 30s (full marquee loop). Hovers: marquee pauses; links use opacity reduction (no codebase-defined hover color shift).

**Borders & corners.** `rounded-sm` (2px) is the default — used on hero CTAs, character portraits, attribute cards, gallery tiles, code blocks. `rounded-md` (6px) shows up only on character page covers and ticker images. `rounded-lg` (8px) is rare — `TextWithImage` and `ImageCards` use it for image containers. Borders are barely used; depth comes from color contrast, not strokes.

**Shadows.** Almost none. `shadow-md` appears on the character portrait card. The system leans on **flat, dark layered surfaces** (`bg-slate-800/50`, `bg-slate-800/40`) instead of elevation.

**Transparency & blur.** Used to layer slate over image backgrounds: `bg-slate-800/50` for portrait card, `bg-slate-800/60` for attribute cells, `bg-slate-800/40` for gallery tiles, `bg-black/40` and `bg-black/70` for hero overlays. **No backdrop-blur in the codebase** — the team reaches for tinted translucency, not glass.

**Layout rules.** Header is non-sticky (just a `Bounded as="header"`). Content stays inside `max-w-6xl`. Heroes break out to full-bleed only for the background image. Image tickers go full-viewport-width via `width: 100vw; margin-left: calc(50% - 50vw)`.

**Press states.** Not codified — no shrink, no color change. Hover on the marquee pauses motion; that's the only documented affordance.

**Imagery vibe.** Hand-drawn comic art. Color in actual published HotC pages: warm desaturated palette (browns, dusty blues, ash-grey skies) with selective saturated accents. Imagery is treated reverently — large, uncropped where possible, `object-cover` only when frame ratio demands it. `quality={100}` and `imgixParams={{ q: 100, auto: null }}` are explicitly set on episode panels and hero covers — **don't downsample comic art**.

**Cards.** "Cards" in this codebase are minimal: a tinted slate background (`bg-slate-800/60`), `rounded-sm` corners, padding of 3 (12px), no border, no shadow. They live inside hero sections and feel like inset chips, not raised tiles.

## Iconography

**No icon font.** No Heroicons, Lucide, or Tabler import in the codebase.

**Built-in:** None — the site relies on uploaded SVG/PNG icons through Prismic image fields. Navigation items have an optional `icon_image` field; brand has `icon_image`; social links use a `Select` keyed on string identifiers (`X`, `instagram`, `tumblr`, `webtoon`, `tapas`, `youtube`, `tiktok`, `discord`, `github`, `other`) — but the rendering of those keys is content-driven, not in the code.

**This system substitutes** **Lucide** (CDN: `https://unpkg.com/lucide-static@latest`) for the social and UI affordances we need to mock — same line weight (1.5px), same square-ish proportions. **Flagged for review** — the creator may have hand-drawn glyphs they'd prefer.

**Inline glyphs.** Quote slice uses `&ldquo;` and `&rdquo;` (typographic curly quotes) and `&mdash;` (em dash) for source attribution. These count as deliberate type, not icons.

**Emoji.** Never.

**Logo.** The codebase reads logo + brand icon from Prismic settings (`settings.data.logo`, `settings.data.brand[0].icon_image`). The repo doesn't ship the actual logo file — `assets/logo-placeholder.svg` in this design system is a wordmark stand-in. **Flagged — the creator should drop in the real wordmark.**

## Substitutions flagged

1. **Brand accent color** (`--hotc-ember #D97757`) — invented for CTAs/links since the codebase has no brand chroma. **Replace if HotC has an official accent.**
2. **Icon set** — Lucide stand-ins. Replace with real glyphs/SVGs if the creator has them.
3. **Logo wordmark** — placeholder. Drop in the real HotC logo.
4. **Comic page imagery** — preview cards use Unsplash placeholders matching the mocks. Replace with real episode panels.
