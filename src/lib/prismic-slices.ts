type SliceLike = {
  slice_type?: string | null;
};

const SLICE_TYPE_ALIASES: Record<string, string> = {
  parallaxhero: "parallax_hero",
};

export function normalizeSliceType(sliceType?: string | null): string | undefined {
  if (!sliceType) return undefined;
  return SLICE_TYPE_ALIASES[sliceType] ?? sliceType;
}

export function normalizeSlices<T extends SliceLike>(slices: readonly T[] | null | undefined): T[] {
  return (slices ?? []).map((slice) => {
    const normalizedType = normalizeSliceType(slice.slice_type);
    if (!normalizedType || normalizedType === slice.slice_type) return slice;

    return {
      ...slice,
      slice_type: normalizedType,
    };
  });
}
