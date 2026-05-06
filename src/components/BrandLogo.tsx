import Image from "next/image";

type BrandLogoProps = {
  src: string;
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
  src,
  alt = "",
  className = "",
  width,
  height,
  sizes,
}: BrandLogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={getDimension(width, 320)}
      height={getDimension(height, 120)}
      className={className}
      sizes={sizes}
      loading="eager"
      decoding="async"
    />
  );
}
