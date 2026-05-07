"use client";

import Image from "next/image";
import { useState } from "react";

type LiteYouTubeEmbedProps = {
  videoId: string;
  title: string;
};

function getPosterUrl(videoId: string, useWebp: boolean) {
  if (useWebp) {
    return `https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`;
  }

  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export default function LiteYouTubeEmbed({
  videoId,
  title,
}: LiteYouTubeEmbedProps) {
  const [isActivated, setIsActivated] = useState(false);
  const [useWebpPoster, setUseWebpPoster] = useState(true);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1`;

  if (isActivated) {
    return (
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="hotc-ytembed__button"
      aria-label={`Play ${title}`}
      onClick={() => setIsActivated(true)}
    >
      <Image
        src={getPosterUrl(videoId, useWebpPoster)}
        alt=""
        fill
        sizes="(max-width: 767px) 100vw, 960px"
        className="hotc-ytembed__thumb"
        quality={75}
        onError={() => {
          if (useWebpPoster) {
            setUseWebpPoster(false);
          }
        }}
      />
      <span className="hotc-ytembed__play" aria-hidden="true">
        <span className="hotc-ytembed__play-icon" />
      </span>
      <span className="hotc-ytembed__button-title">{title}</span>
    </button>
  );
}
