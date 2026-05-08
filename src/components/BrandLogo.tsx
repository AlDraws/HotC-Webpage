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
  preload?: boolean;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  quality?: number;
  decorative?: boolean;
};

function getDimension(value: number | null | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

export default function BrandLogo({
  field,
  src,
  alt = "",
  className = "",
  width,
  height,
  sizes,
  preload,
  loading,
  fetchPriority,
  quality,
  decorative,
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
        preload={preload}
        loading={loading ?? "lazy"}
        fetchPriority={fetchPriority ?? "low"}
        quality={quality ?? 75}
        decorative={decorative}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={decorative ? "" : alt}
      width={getDimension(width, 320)}
      height={getDimension(height, 120)}
      className={className}
      sizes={sizes}
      decoding="async"
      preload={preload}
      loading={loading ?? "lazy"}
      fetchPriority={fetchPriority ?? "low"}
      quality={quality ?? 75}
    />
  );
}
