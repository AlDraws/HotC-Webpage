---
name: heirs-of-the-collapse-design
description: Use this skill to generate well-branded interfaces and assets for Heirs of the Collapse (HotC), a webcomic project — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. The base palette is dark (slate-900 ink), the only chroma is **ember `#D97757`** (a proposed accent — confirm with the creator if uncertain), and the type system uses Inter at semibold/bold with **tight tracking** on headings.

If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand. The reference codebase is **Next.js 15 + React 19 + Tailwind v4 + Prismic** at `AlDraws/HotC-Webpage`.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions (Which surface — home / episode reader / character / lore / store? Are they styling a real component or making a one-off mock? Do they have real comic panels and a logo, or do we use the placeholders?), and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## File map

- `README.md` — brand context, content fundamentals, visual foundations, iconography, sources
- `colors_and_type.css` — drop-in CSS custom properties (color, type ramp, spacing, radii, motion)
- `assets/` — placeholder logos, social icons, generic comic-panel artwork
- `preview/` — design system review cards (one HTML per concept)
- `ui_kits/website/` — pixel-fidelity React/JSX recreation of the HotC site (header, hero, ticker, character grid, character profile, episode index, episode reader). Open `ui_kits/website/index.html`.

## Substitutions to call out before shipping

1. **Brand accent** (`#D97757`) — invented; replace if HotC has an official chroma
2. **Icon set** — Lucide stand-ins; replace with custom glyphs if available
3. **Logo wordmark** — typographic placeholder; drop in the real HotC mark
4. **Comic panels** — generic SVG placeholders; swap with real episode art
