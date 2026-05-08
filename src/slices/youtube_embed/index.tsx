import * as prismic from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import LiteYouTubeEmbed from "@/components/LiteYouTubeEmbed";
import { getSliceLocale, type HotcSliceContext } from "@/lib/slice-context";
import { getUiCopy } from "@/lib/ui-copy";

type YoutubeEmbedSlice = prismic.SharedSlice<
  "youtube_embed",
  prismic.SharedSliceVariation<
    "default",
    {
      kicker: prismic.KeyTextField;
      title: prismic.KeyTextField;
      youtube_url: prismic.KeyTextField;
      caption: prismic.RichTextField;
    },
    never
  >
>;

export type YoutubeEmbedProps = SliceComponentProps<YoutubeEmbedSlice, HotcSliceContext>;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

function getYouTubeVideoId(rawUrl: string | null | undefined) {
  if (!rawUrl) return null;
  const normalizedUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return null;
  }

  if (!YOUTUBE_HOSTS.has(parsed.hostname)) return null;

  let videoId = "";

  if (parsed.hostname.includes("youtu.be")) {
    videoId = parsed.pathname.replace("/", "");
  } else if (parsed.pathname.startsWith("/watch")) {
    videoId = parsed.searchParams.get("v") ?? "";
  } else if (parsed.pathname.startsWith("/shorts/")) {
    videoId = parsed.pathname.split("/")[2] ?? "";
  } else if (parsed.pathname.startsWith("/embed/")) {
    videoId = parsed.pathname.split("/")[2] ?? "";
  }

  videoId = videoId.trim();
  if (!videoId) return null;

  return videoId;
}

const YoutubeEmbed = ({ slice, context }: YoutubeEmbedProps) => {
  const locale = getSliceLocale(context);
  const copy = getUiCopy(locale);
  const videoId = getYouTubeVideoId(slice.primary.youtube_url);
  const videoTitle = slice.primary.title || copy.youtube.videoFallbackTitle;

  return (
    <Bounded as="section" data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
      <div className="hotc-ytembed">
        {(slice.primary.kicker || slice.primary.title) && (
          <header className="hotc-ytembed__head">
            {slice.primary.kicker ? (
              <span className="hotc-kicker">{slice.primary.kicker}</span>
            ) : null}
            {slice.primary.title ? (
              <h2 className="hotc-ytembed__title">{slice.primary.title}</h2>
            ) : null}
          </header>
        )}

        {videoId ? (
          <div className="hotc-ytembed__frame">
            <LiteYouTubeEmbed videoId={videoId} title={videoTitle} playLabel={copy.common.play} />
          </div>
        ) : (
          <p className="hotc-ytembed__error">{copy.youtube.invalidUrl}</p>
        )}

        {isFilled.richText(slice.primary.caption) ? (
          <div className="hotc-ytembed__caption">
            <PrismicRichText field={slice.primary.caption} />
          </div>
        ) : null}
      </div>
    </Bounded>
  );
};

export default YoutubeEmbed;
