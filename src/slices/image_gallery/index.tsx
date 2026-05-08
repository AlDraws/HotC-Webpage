import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import { formatUiText, getUiCopy } from "@/lib/ui-copy";
import GalleryTile from "./GalleryTile";

export type ImageGalleryProps = SliceComponentProps<
  Content.ImageGallerySlice,
  HotcSliceContext
>;

const ImageGallery = ({ slice, context }: ImageGalleryProps) => {
  const locale = getSliceLocale(context);
  const copy = getUiCopy(locale);

  const images = slice.items
    .map((item, index) => ({
      field: item.image,
      src: item.image.url || "",
      alt:
        item.image.alt ||
        formatUiText(copy.images.galleryImage, { index: index + 1 }),
      width: item.image.dimensions?.width,
      height: item.image.dimensions?.height,
    }))
    .filter((image) => Boolean(image.src));

  const lightboxImages = images.map(({ src, alt, width, height }) => ({
    src,
    alt,
    width,
    height,
  }));

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      as="section"
    >
      <div className="hotc-gallery">
        {images.map((image, index) => (
          <GalleryTile
            key={image.src}
            field={image.field}
            alt={image.alt}
            ariaLabel={formatUiText(copy.images.galleryImage, { index: index + 1 })}
            images={lightboxImages}
            index={index}
          />
        ))}
      </div>
    </Bounded>
  );
};

export default ImageGallery;
