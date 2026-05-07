"use client";

import { asImageSrc, type ImageFieldImage } from "@prismicio/client";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  field: ImageFieldImage;
  alt: string;
  panelIndex: number;
  sequenceId: string;
};

type SequenceStore = {
  unlockedPanels: Set<number>;
  listeners: Set<() => void>;
};

const sequenceStores = new Map<string, SequenceStore>();

function getSequenceStore(sequenceId: string): SequenceStore {
  const existingStore = sequenceStores.get(sequenceId);
  if (existingStore) {
    return existingStore;
  }

  const nextStore: SequenceStore = {
    unlockedPanels: new Set([0]),
    listeners: new Set(),
  };

  sequenceStores.set(sequenceId, nextStore);

  return nextStore;
}

function isPanelUnlocked(sequenceId: string, panelIndex: number) {
  if (panelIndex === 0) {
    return true;
  }

  return getSequenceStore(sequenceId).unlockedPanels.has(panelIndex);
}

function subscribeToSequence(sequenceId: string, listener: () => void) {
  const store = getSequenceStore(sequenceId);
  store.listeners.add(listener);

  return () => {
    store.listeners.delete(listener);

    if (store.listeners.size === 0) {
      sequenceStores.delete(sequenceId);
    }
  };
}

function unlockPanel(sequenceId: string, panelIndex: number) {
  if (panelIndex < 0) {
    return;
  }

  const store = getSequenceStore(sequenceId);
  if (store.unlockedPanels.has(panelIndex)) {
    return;
  }

  store.unlockedPanels.add(panelIndex);
  store.listeners.forEach((listener) => listener());
}

export default function SequentialEpisodeImage({
  field,
  alt,
  panelIndex,
  sequenceId,
}: Props) {
  const [isUnlocked, setIsUnlocked] = useState(() =>
    isPanelUnlocked(sequenceId, panelIndex),
  );
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const src = asImageSrc(field);

  useEffect(() => {
    return subscribeToSequence(sequenceId, () => {
      setIsUnlocked(isPanelUnlocked(sequenceId, panelIndex));
    });
  }, [panelIndex, sequenceId]);

  useEffect(() => {
    if (panelIndex < 1 || !isUnlocked || !imageElement) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        unlockPanel(sequenceId, panelIndex + 1);
        observer.disconnect();
      },
      { rootMargin: "0px 0px 3000px 0px" },
    );

    observer.observe(imageElement);

    return () => {
      observer.disconnect();
    };
  }, [imageElement, isUnlocked, panelIndex, sequenceId]);

  if (!src) {
    return null;
  }

  const width = field.dimensions?.width ?? 1080;
  const height = field.dimensions?.height ?? width;
  const isFirstPanel = panelIndex === 0;
  const isSecondPanel = panelIndex === 1;
  const loading = isFirstPanel || isUnlocked ? "eager" : "lazy";
  const fetchPriority =
    isFirstPanel || (isSecondPanel && isUnlocked) ? "high" : "auto";

  return (
    <Image
      ref={setImageElement}
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={100}
      className="block h-auto w-full"
      sizes="(min-width: 1080px) 1080px, 100vw"
      preload={isFirstPanel}
      loading={loading}
      fetchPriority={fetchPriority}
      onLoad={() => {
        if (isFirstPanel) {
          unlockPanel(sequenceId, 1);
          return;
        }

        if (typeof IntersectionObserver === "undefined") {
          unlockPanel(sequenceId, panelIndex + 1);
        }
      }}
    />
  );
}
