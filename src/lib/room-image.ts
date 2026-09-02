/** Public marketing site — used to resolve `/assets/...` room image paths. */
function publicFrontendBase(): string {
  return (import.meta.env.VITE_PUBLIC_FRONTEND_URL?.trim() || "http://localhost:3001").replace(/\/$/, "");
}

/** Normalize a room image string for use in `<img src>`. */
export function resolveRoomImageSrc(src: string | undefined | null): string | null {
  const trimmed = src?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:") || /^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${publicFrontendBase()}${trimmed}`;
  return trimmed;
}

/** First loadable image from a room, or null. */
export function pickRoomImageSrc(images: string[] | undefined | null): string | null {
  if (!images?.length) return null;
  for (const raw of images) {
    const resolved = resolveRoomImageSrc(raw);
    if (resolved) return resolved;
  }
  return null;
}
