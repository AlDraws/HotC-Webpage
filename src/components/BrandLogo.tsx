import type { ImageField } from "@prismicio/client";
import Image from "next/image";
import PrismicImage from "@/components/PrismicImage";

type BrandLogoProps = {
  field?: ImageField | null;
  src?: string;
  alt?: string;
  className?: string;
  width?: number | null;
  height?: number | null;
  sizes?: string;
};

function getDimension(value: number | null | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

export default function BrandLogo({
  field,
  src,
  alt = "",
  className = "",
  width,
  height,
  sizes,
}: BrandLogoProps) {
  const resolvedSrc = src || field?.url;
  if (!resolvedSrc) return null;

  if (field?.url) {
    return (
      <PrismicImage
        field={field}
        alt={alt}
        width={getDimension(width, 320)}
        height={getDimension(height, 120)}
        className={className}
        sizes={sizes}
        loading="lazy"
        fetchPriority="low"
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={getDimension(width, 320)}
      height={getDimension(height, 120)}
      className={className}
      sizes={sizes}
      decoding="async"
      loading="lazy"
      fetchPriority="low"
    />
  );
}
