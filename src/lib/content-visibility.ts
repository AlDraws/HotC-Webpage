type VisibilityControlledData = {
  is_visible?: boolean | null;
};

type VisibilityControlledDocument = {
  data?: unknown;
};

export function isVisibleData(data: unknown): boolean {
  if (!data || typeof data !== "object") {
    return true;
  }

  return (data as VisibilityControlledData).is_visible !== false;
}

export function isDocumentVisible<T extends VisibilityControlledDocument>(
  document: T | null | undefined
): document is T {
  if (!document) {
    return false;
  }

  return isVisibleData(document.data);
}

export function filterVisibleDocuments<T extends VisibilityControlledDocument>(
  documents: readonly T[] | null | undefined
): T[] {
  return (documents ?? []).filter(isDocumentVisible);
}
