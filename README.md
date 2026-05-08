# Heirs of the Collapse — Webpage

Next.js 16 + Prismic + Tailwind 4. Internationalized (English / Spanish), deployed on Vercel.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| CMS | Prismic (Slice Machine) |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 (strict) |
| i18n | Custom locale routing via middleware |

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in values
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See [`.env.example`](.env.example) for the full list. The minimum required for local dev:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_PRISMIC_ENVIRONMENT` | Prismic repository name (overrides `slicemachine.config.json`) |
| `NEXT_PUBLIC_SITE_URL` | Used for `metadataBase`, OG tags, and sitemap |
| `PRISMIC_WEBHOOK_SECRET` | Required for `/api/revalidate` to accept Prismic webhooks |

Vercel sets `VERCEL_URL` and `VERCEL_PROJECT_PRODUCTION_URL` automatically in deploy previews and production.

## Available scripts

```bash
npm run dev                         # Dev server (http://localhost:3000)
npm run build                       # Production build
npm run start                       # Start production build locally
npm run lint                        # ESLint (zero warnings)
npm run typecheck                   # TypeScript check (no emit)
npm run slicemachine                # Slice Machine UI (http://localhost:9999)
npm run prismic:translations:export # Export content for translation
npm run prismic:translations:import # Import translated content back
node scripts/check-i18n-parity.mjs  # Verify es.json has all keys from en.json
```

## Project structure

```
src/
  app/
    [locale]/          # Locale-scoped routes (en, es)
      page.tsx         # Home (renders Prismic "home" document)
      episodes/        # Episode index + reader
      characters/      # Character list + detail
      lore/            # Lore archive + entry
      store/           # Store page
    api/
      locale/          # POST — sets locale preference cookie (HttpOnly)
      preview/         # Prismic preview entry point
      exit-preview/    # Prismic exit preview
      revalidate/      # Prismic webhook → revalidateTag("prismic")
  components/          # Shared UI components (Header, Footer, Lightbox…)
  lib/                 # Utilities (seo, locale, ui-copy, format…)
  locales/ui/          # en.json / es.json — static UI copy
  slices/              # Prismic slice components
  prismicio.ts         # Prismic client + route resolver
  proxy.ts             # Middleware: locale redirect based on cookie / Accept-Language
```

## Internationalization

Routes use a `[locale]` segment (`/en/…`, `/es/…`). The middleware in `src/proxy.ts` redirects root paths to the right locale based on:

1. The `hotc-locale` cookie (set by `/api/locale` after the user switches language)
2. The `Accept-Language` header (fallback)

**Adding a new locale:** add the entry to `PRISMIC_LANG_BY_LOCALE` and `HREFLANG_BY_LOCALE` in `src/lib/locale.ts`, add the corresponding `src/locales/ui/<locale>.json`, and run `node scripts/check-i18n-parity.mjs` to verify parity.

**Translating content:**
```bash
# Export a round-trip file and a human-readable Markdown summary
npm run prismic:translations:export -- --from en --to es

# Edit translations/prismic-en-us-to-es-es.json (translate each "target" value)

# Import back into Prismic as a migration release
npm run prismic:translations:import -- --file translations/prismic-en-us-to-es-es.json
```

The import does **not** publish automatically — review and publish from the Prismic dashboard.

## CMS preview

Prismic draft previews work out of the box via the `/api/preview` route. Enable draft mode by clicking *Preview* in the Prismic editor; exit via the *Exit preview* link or `/api/exit-preview`.

## Cache revalidation

On-demand ISR is driven by a Prismic webhook pointing to `/api/revalidate`. The webhook **must** include a secret that matches `PRISMIC_WEBHOOK_SECRET` in your environment.

Configure in Prismic: **Settings → Webhooks** → add URL `https://<your-domain>/api/revalidate` with a secret.

## Slice Machine

```bash
npm run slicemachine
```

Opens the Slice Machine UI at [http://localhost:9999](http://localhost:9999) for creating and editing slices. Changes are reflected in `src/slices/` and `customtypes/`.

## Deployment

The project deploys to Vercel. Push to `main` triggers a production deploy. GitHub Actions runs lint, typecheck, i18n parity, and a production build on every push and pull request.

Set the following secrets in **GitHub → Settings → Secrets → Actions** for CI builds:

- `NEXT_PUBLIC_PRISMIC_ENVIRONMENT`
- `NEXT_PUBLIC_SITE_URL`
