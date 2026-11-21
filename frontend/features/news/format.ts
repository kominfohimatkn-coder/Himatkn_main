import { formatDateLong, formatDateShort } from "@/lib/format-date";

import type { PublicNewsBase, PublicNewsItem } from "./types";

/**
 * `published_at` dari API berupa datetime (`YYYY-MM-DDTHH:MM:SS`), sedangkan
 * helper tanggal publik menerima `YYYY-MM-DD`. Ambil bagian tanggalnya saja
 * supaya hasilnya sama dengan `fmt` prototype.
 */
function dateOnly(value: string | null): string | null {
  if (!value) return null;

  return /^(\d{4}-\d{2}-\d{2})/.exec(value)?.[1] ?? null;
}

/** Contoh: `7 Mar 2026` (kartu publikasi). */
export function formatNewsDateShort(value: string | null): string | null {
  return formatDateShort(dateOnly(value));
}

/** Contoh: `7 Maret 2026` (detail publikasi). */
export function formatNewsDateLong(value: string | null): string | null {
  return formatDateLong(dateOnly(value));
}

function firstImageUrl(item: PublicNewsBase): string | null {
  return item.images.find((image) => image.url?.trim())?.url ?? null;
}

/** Featured image, atau gambar pertama bila featured kosong. */
export function getNewsCover(item: PublicNewsBase): string | null {
  const featured = item.featured_image?.trim();

  return featured || firstImageUrl(item);
}

/**
 * Gambar galeri selain cover. Bila cover berasal dari gambar pertama,
 * gambar itu dilewati supaya tidak tampil dua kali.
 */
export function getNewsGalleryImages(item: PublicNewsBase) {
  const images = item.images.filter((image) => image.url?.trim());
  const featured = item.featured_image?.trim();

  if (featured) {
    return images.filter((image) => image.url?.trim() !== featured);
  }

  return images.slice(1);
}

/** Potongan teks polos dari excerpt backend untuk kartu publikasi. */
export function newsExcerpt(
  item: PublicNewsItem,
  maxLength = 150,
): string | null {
  const text = item.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  if (!text) return null;
  if (text.length <= maxLength) return text;

  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${cut.trimEnd()}…`;
}
