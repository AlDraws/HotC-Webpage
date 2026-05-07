import { asImageWidthSrcSet } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { EpisodePanelSlice } from "@/../prismicio-types";
import PrismicImage from "@/components/PrismicImage";
import type { EpisodePanelSequenceContext } from "@/slices/episode_panel/sequence-context";

export type EpisodePanelProps = SliceComponentProps<
  EpisodePanelSlice,
  EpisodePanelSequenceContext
>;

const FIRST_COMIC_SEGMENT_HEIGHT = 960;
const COMIC_SEGMENT_HEIGHT = 1920;
const COMIC_SEGMENT_QUALITY = 55;
const COMIC_IMAGE_SIZES =
  "(max-width: 480px) 90vw, (max-width: 1080px) 100vw, 980px";
const COMIC_IMAGE_WIDTHS = [480, 640, 750, 828, 1080];

function getPanelSegments(width: number, height: number) {
  if (height <= COMIC_SEGMENT_HEIGHT * 1.15) {
    return [{ y: 0, height }];
  }

  const firstSegmentHeight = Math.min(FIRST_COMIC_SEGMENT_HEIGHT, height);
  const segments = [{ y: 0, height: firstSegmentHeight }];

  for (let y = firstSegmentHeight; y < height; y += COMIC_SEGMENT_HEIGHT) {
    segments.push({
      y,
      height: Math.min(COMIC_SEGMENT_HEIGHT, height - y),
    });
  }

  return segments;
}

const EpisodePanel = ({ slice, index, context }: EpisodePanelProps) => {
  const panelIndex = context.panelOrderBySliceIndex[index] ?? 0;
  const image = slice.primary.image;
  const width = image.dimensions?.width ?? 1080;
  const height = image.dimensions?.height ?? width;
  const segments = getPanelSegments(width, height);
  const alt = image.alt || slice.primary.label || `Comic page ${panelIndex + 1}`;

  return (
    <div className="hotc-ep-panel">
      {image?.url
        ? segments.map((segment, segmentIndex) => {
            const isFirstSegment = panelIndex === 0 && segmentIndex === 0;
            const isSingleSegment = segments.length === 1;
            const imgixParams = {
              rect: [0, segment.y, width, segment.height] as [
                number,
                number,
                number,
                number,
              ],
            };
            const segmentAlt =
              segmentIndex === 0
                ? alt
                : `${alt}, segment ${segmentIndex + 1}`;
            const deferredSrc = asImageWidthSrcSet(image, {
              auto: ["format", "compress"],
              q: COMIC_SEGMENT_QUALITY,
              widths: COMIC_IMAGE_WIDTHS,
              ...imgixParams,
            });

            return (
              <div
                key={`${segment.y}-${segment.height}`}
                className={`hotc-ep-panel__segment${
                  isFirstSegment ? " is-lcp" : ""
                }`}
                style={{ aspectRatio: `${width} / ${segment.height}` }}
              >
                {isFirstSegment ? (
                  <PrismicImage
                    field={image}
                    alt={segmentAlt}
                    width={width}
                    height={segment.height}
                    quality={COMIC_SEGMENT_QUALITY}
                    className="block h-auto w-full"
                    sizes={COMIC_IMAGE_SIZES}
                    decoding="async"
                    loading="eager"
                    fetchPriority="high"
                    imgixParams={imgixParams}
                  />
                ) : deferredSrc ? (
                  <>
                    <img
                      alt=""
                      aria-hidden="true"
                      width={width}
                      height={segment.height}
                      className="hotc-ep-panel__deferred block h-auto w-full"
                      decoding="async"
                      loading="lazy"
                      fetchPriority="low"
                      data-hotc-deferred-comic="true"
                      data-src={deferredSrc.src}
                      data-srcset={deferredSrc.srcset}
                      data-sizes={COMIC_IMAGE_SIZES}
                    />
                    <noscript>
                      <img
                        alt={isSingleSegment ? segmentAlt : ""}
                        width={width}
                        height={segment.height}
                        className="block h-auto w-full"
                        decoding="async"
                        loading="lazy"
                        src={deferredSrc.src}
                        srcSet={deferredSrc.srcset}
                        sizes={COMIC_IMAGE_SIZES}
                      />
                    </noscript>
                  </>
                ) : null}
              </div>
            );
          })
        : null}
    </div>
  );
};

export default EpisodePanel;
