/**
 * Converts any media URL (private Vercel Blob, public upload, or external)
 * into a valid browser-accessible URL.
 */
export function getPublicMediaUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed) return "";

  // If already proxied, return as is
  if (trimmed.startsWith("/api/media/proxy") || trimmed.startsWith("api/media/proxy")) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  // If local public upload or local static asset or data URI
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/accomodation") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // If it is a private or direct Vercel Blob URL, route through the authorized media proxy
  if (
    trimmed.includes("private.blob.vercel-storage.com") ||
    trimmed.includes("blob.vercel-storage.com")
  ) {
    return `/api/media/proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

export const FALLBACK_RESIDENCE_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
];
