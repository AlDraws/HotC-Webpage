import type { ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { forwardRef, type ComponentProps } from "react";

type BasePrismicImageProps = ComponentProps<typeof PrismicNextImage>;

export type PrismicImageProps = Omit<
  BasePrismicImageProps,
  "field" | "alt" | "fallbackAlt"
> & {
  field?: ImageField | null;
  alt?: string | null;
  fallbackAlt?: string | null;
  decorative?: boolean;
};

function resolveAltText({
  field,
  alt,
  fallbackAlt,
  decorative,
}: {
  field?: ImageField | null;
  alt?: string | null;
  fallbackAlt?: string | null;
  decorative?: boolean;
}) {
  if (decorative) {
    return "";
  }

  const candidates = [alt, field?.alt, fallbackAlt];
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const normalized = candidate.trim();
    if (normalized) {
      return normalized;
    }
  }

  return "Illustration from Heirs of the Collapse";
}

const PrismicImage = forwardRef<HTMLImageElement, PrismicImageProps>(
  function PrismicImage(
    {
      field,
      alt,
      fallbackAlt,
      decorative = false,
      decoding = "async",
      loader,
      loading,
      preload,
      fetchPriority,
      quality,
      sizes,
      imgixParams,
      ...restProps
    },
    ref,
  ) {
    if (!field?.url) {
      return null;
    }

    const resolvedField = {
      ...field,
      alt: resolveAltText({
        field,
        alt,
        fallbackAlt,
        decorative,
      }),
    };
    const resolvedLoading =
      loading ?? (preload || fetchPriority === "high" ? "eager" : "lazy");
    const resolvedSizes = sizes ?? (restProps.fill ? "100vw" : undefined);
    const resolvedQuality = quality ?? 75;
    const resolvedImgixQuality =
      typeof resolvedQuality === "number"
        ? resolvedQuality
        : Number.parseInt(resolvedQuality, 10);
    const resolvedImgixParams: BasePrismicImageProps["imgixParams"] = {
      auto: ["format", "compress"],
      q: Number.isFinite(resolvedImgixQuality) ? resolvedImgixQuality : 75,
      ...imgixParams,
    };

    return (
      <PrismicNextImage
        ref={ref}
        field={resolvedField}
        loader={loader}
        decoding={decoding}
        loading={resolvedLoading}
        preload={preload}
        fetchPriority={fetchPriority}
        quality={resolvedQuality}
        sizes={resolvedSizes}
        imgixParams={resolvedImgixParams}
        {...(decorative ? { alt: "" as const } : {})}
        {...restProps}
      />
    );
  },
);

export default PrismicImage;
