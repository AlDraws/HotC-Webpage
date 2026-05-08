import { asText, type RichTextField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import type { CSSProperties } from "react";
import Bounded from "@/components/Bounded";
import PrismicImage from "@/components/PrismicImage";
import { getContextualCtaAriaLabel } from "@/lib/a11y";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import { getUiCopy } from "@/lib/ui-copy";
import {
  ExternalSupportSlice,
  ExternalSupportSliceBannerItem,
  ExternalSupportSliceCardsItem,
  ExternalSupportSliceRowItem,
} from "@/../prismicio-types";

export type ExternalSupportProps = SliceComponentProps<ExternalSupportSlice, HotcSliceContext>;
type ExternalSupportItem =
  | ExternalSupportSliceRowItem
  | ExternalSupportSliceCardsItem
  | (ExternalSupportSliceBannerItem & {
      description?: ExternalSupportSliceRowItem["description"];
      icon?: ExternalSupportSliceRowItem["icon"];
    });
type ExternalSupportItemWithOptionalMedia = ExternalSupportItem & {
  description?: ExternalSupportSliceRowItem["description"];
  icon?: ExternalSupportSliceRowItem["icon"];
};

function getTextContent(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (Array.isArray(value)) {
    const text = (asText(value as RichTextField) || "").trim();
    return text || null;
  }

  return null;
}

/**
 * ExternalSupport — modular block of external CTAs.
 *
 * Designed so you can add Patreon today, Kickstarter later, Ko-fi after that,
 * etc., without touching code. Each item is a repeatable Group entry in
 * Prismic with: platform (select), label, description, url, icon, accent.
 *
 * Variations:
 *  - "row"    : horizontal strip of buttons (good for footer / hero footer)
 *  - "cards"  : richer card grid with description + icon (good for /support page)
 *  - "banner" : single full-width strip with one or two prominent CTAs
 */
const ExternalSupport = ({ slice, context }: ExternalSupportProps) => {
  const locale = getSliceLocale(context);
  const copy = getUiCopy(locale);
  const variation = slice.variation;
  const items = (slice.items ?? []) as ExternalSupportItemWithOptionalMedia[];

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={variation}
      className="bg-slate-900 text-white"
    >
      <Bounded yPadding="base">
        {slice.primary.title ? (
          <PrismicRichText
            field={slice.primary.title}
            components={{
              heading2: ({ children }) => (
                <h2 className="mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  {children}
                </h2>
              ),
            }}
          />
        ) : null}
        {slice.primary.body ? (
          <div className="mb-10 max-w-2xl text-slate-200">
            <PrismicRichText field={slice.primary.body} />
          </div>
        ) : null}

        {variation === "cards" ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it: ExternalSupportItem, i: number) => {
              const ctaLabel = it.label || copy.externalSupport.supportProject;
              const ctaContext =
                it.platform ||
                getTextContent(it.description) ||
                getTextContent(slice.primary.title) ||
                null;
              const ctaAriaLabel = getContextualCtaAriaLabel(it.label || null, ctaContext, locale);

              return (
                <li
                  key={i}
                  className="flex flex-col gap-3 rounded-sm bg-slate-800/60 p-5"
                  style={
                    it.accent
                      ? ({ borderTop: `2px solid ${it.accent}` } as CSSProperties)
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3">
                    {it.icon?.url ? (
                      <PrismicImage
                        field={it.icon}
                        decorative
                        width={28}
                        height={28}
                        className="h-7 w-7 object-contain"
                      />
                    ) : null}
                    <span className="text-sm tracking-wide text-slate-300 uppercase">
                      {it.platform || copy.externalSupport.support}
                    </span>
                  </div>
                  <p className="text-base text-slate-100">{it.description}</p>
                  <PrismicNextLink
                    field={it.url}
                    className="mt-auto inline-block rounded-sm px-4 py-2 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: it.accent || "var(--hotc-ember, #D97757)",
                    }}
                    aria-label={ctaAriaLabel}
                  >
                    {ctaLabel}
                  </PrismicNextLink>
                </li>
              );
            })}
          </ul>
        ) : null}

        {variation === "row" ? (
          <ul className="flex flex-wrap gap-3">
            {items.map((it: ExternalSupportItem, i: number) => (
              <li key={i}>
                <PrismicNextLink
                  field={it.url}
                  className="inline-flex items-center gap-2 rounded-sm px-5 py-3 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: it.accent || "var(--hotc-ember, #D97757)",
                  }}
                >
                  {it.icon?.url ? (
                    <PrismicImage
                      field={it.icon}
                      decorative
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  ) : null}
                  {it.label || it.platform}
                </PrismicNextLink>
              </li>
            ))}
          </ul>
        ) : null}

        {variation === "banner" ? (
          <div className="flex flex-col items-start justify-between gap-4 rounded-sm bg-slate-800/60 p-6 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-3">
              {items.map((it: ExternalSupportItem, i: number) => (
                <PrismicNextLink
                  key={i}
                  field={it.url}
                  className="inline-flex items-center gap-2 rounded-sm px-5 py-3 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: it.accent || "var(--hotc-ember, #D97757)",
                  }}
                >
                  {it.label || it.platform}
                </PrismicNextLink>
              ))}
            </div>
          </div>
        ) : null}
      </Bounded>
    </section>
  );
};

export default ExternalSupport;
