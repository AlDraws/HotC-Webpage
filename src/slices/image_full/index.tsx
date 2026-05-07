import { SliceComponentProps } from "@prismicio/react";
import PrismicImage from "@/components/PrismicImage";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import { getUiCopy } from "@/lib/ui-copy";
import { ImageFullSlice } from "@/../prismicio-types";

/**
 * Props for `ImageFull`.
 */
export type ImageFullProps = SliceComponentProps<ImageFullSlice, HotcSliceContext>;

/**
 * Component for "ImageFull" Slices.
 * Replicates: <figure class="hotc-image-full"><img /></figure>
 * from ui_kits/website/Slices.jsx::ImageFull
 */
const ImageFull = ({ slice, context }: ImageFullProps) => {
  const locale = getSliceLocale(context);
  const copy = getUiCopy(locale);
  return (
    <figure
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hotc-image-full"
    >
      <PrismicImage
        field={slice.primary.image}
        fallbackAlt={copy.images.fullWidthArtworkAlt}
        loading="lazy"
        sizes="100vw"
        quality={70}
      />
    </figure>
  );
};

export default ImageFull;
