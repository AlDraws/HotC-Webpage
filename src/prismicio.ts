import { createClient as baseCreateClient, type ClientConfig, type Route } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import { PRISMIC_LANG_BY_LOCALE, type AppLocale, type PrismicLang } from "@/lib/locale";
import sm from "../slicemachine.config.json";

/**
 * The project's Prismic repository name.
 */
export const repositoryName = process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

/**
 * Route Resolver — maps Prismic document types to their URL paths.
 * This allows Prismic to resolve the `url` field on link fields.
 *
 * {@link https://prismic.io/docs/route-resolver#route-resolver}
 */
const baseRoutes: Route[] = [
  { type: "home", path: "/" },
  { type: "page", uid: "characters", path: "/characters" },
  { type: "page", uid: "lore", path: "/lore" },
  { type: "page", uid: "store", path: "/store" },
  { type: "page", path: "/:uid" },
  { type: "episodes_index", path: "/episodes" },
  { type: "episode", path: "/episodes/:uid" },
  { type: "lore_entry", path: "/lore/:uid" },
  { type: "character", path: "/characters/:uid" },
];

const localeEntries = Object.entries(PRISMIC_LANG_BY_LOCALE) as [AppLocale, PrismicLang][];

const routes: Route[] = localeEntries.flatMap(([locale, lang]) =>
  baseRoutes.map((route) => ({
    ...route,
    lang,
    path: route.path === "/" ? `/${locale}` : `/${locale}${route.path}`,
  }))
);

const PRISMIC_REVALIDATE_SECONDS = process.env.NODE_ENV === "production" ? 3600 : 5;

export const SLICE_FETCH_LINKS = [
  "character.name",
  "character.role",
  "character.portrait",
  "character.cover",
  "character.is_visible",
  "lore_entry.title",
  "lore_entry.cover",
  "lore_entry.role",
  "lore_entry.category",
  "lore_entry.is_visible",
];

/**
 * Creates a Prismic client for the project's repository.
 *
 * @param config - Configuration for the Prismic client.
 */
export const createClient = (config: ClientConfig = {}) => {
  const client = baseCreateClient(repositoryName, {
    routes,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? {
            next: {
              tags: ["prismic"],
              revalidate: PRISMIC_REVALIDATE_SECONDS,
            },
          }
        : { next: { revalidate: PRISMIC_REVALIDATE_SECONDS } },
    ...config,
  });

  enableAutoPreviews({ client });

  return client;
};
