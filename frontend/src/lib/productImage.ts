import type { Product } from "./types";

export function productImageUrl(
  p: Pick<Product, "image" | "images" | "name">,
): string {
  const candidate =
    Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image;

  if (!candidate) {
    return `https://placehold.co/960x640/27272a/a1a1aa?text=${encodeURIComponent(p.name.slice(0, 24))}`;
  }
  if (candidate.startsWith("http")) return candidate;
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
  return `${base}${candidate.startsWith("/") ? "" : "/"}${candidate}`;
}
