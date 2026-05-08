"use client";

import { useLightbox } from "@/components/LightboxProvider";

type LightboxImage = {
  src: string;
  alt?: string;
  width?: number | null;
  height?: number | null;
};

type Props = {
  image: LightboxImage;
  label: string;
  children: React.ReactNode;
};

export default function ZoomButton({ image, label, children }: Props) {
  const { openLightbox } = useLightbox();

  return (
    <button
      type="button"
      className="hotc-fcard__zoom hotc-pressable"
      onClick={() => openLightbox([image])}
      aria-label={label}
    >
      {children}
    </button>
  );
}
