import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';

export type EpisodePanelProps = SliceComponentProps<Content.EpisodePanelSlice>;

const EpisodePanel: FC<EpisodePanelProps> = ({ slice }) => {
  const { image, alt: altOverride, caption, anchor_label } = slice.primary as any;
  const variant = slice.variation; // "default" (fullWidth) | "narrow"

  const containerClass = variant === 'narrow'
    ? 'mx-auto max-w-4xl'
    : '';

  return (
    <section
      id={typeof anchor_label === 'string' && anchor_label.trim() ? anchor_label : undefined}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="my-6"
    >
      {isFilled.image(image) && (
        <figure className={containerClass}>
          <div className={variant === 'narrow' ? 'overflow-hidden rounded-md' : ''}>
            <PrismicNextImage
              field={image}
              className="w-full h-auto"
              sizes="100vw"
              // Fuerza máxima calidad y evita auto-compress/formato de Imgix
              quality={100}
              imgixParams={{ q: 100, auto: null }}
              // Si hay alt específico en el slice, úsalo; si no, cae al alt del campo
              fallbackAlt=""
            />
          </div>
          {typeof caption === 'string' && caption.trim() && (
            <figcaption className="mt-2 text-center text-sm text-slate-500">{caption}</figcaption>
          )}
        </figure>
      )}
    </section>
  );
};

export default EpisodePanel;
