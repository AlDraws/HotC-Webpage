import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';

export type EpisodeSequenceProps = SliceComponentProps<any>;

const EpisodeSequence: FC<EpisodeSequenceProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="w-full max-w-[1080px] mx-auto bg-[#0B0B0E]"
    >
      <div className="flex flex-col w-full">
        {slice.items?.map((item: any, index: number) => {
          if (!isFilled.image(item.image)) return null;
          return (
            <PrismicNextImage
              key={`es-${index}`}
              field={item.image}
              className="block w-full h-auto m-0 p-0 align-top"
              sizes="100vw"
              quality={100}
              priority={index === 0} // Only prioritize the first image to load fast
              fallbackAlt=""
            />
          );
        })}
      </div>
    </section>
  );
};

export default EpisodeSequence;
