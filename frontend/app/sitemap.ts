import type { MetadataRoute } from "next";

import { getPublicNews } from "@/features/news/public-api";
import { getPublicPrograms } from "@/features/programs/public-api";

const SITE_URL = "https://www.himatknuklir.web.id";
/** Batas `limit` dari backend untuk daftar publik. */
const PAGE_SIZE = 50;
/** Pengaman: maksimal 20 halaman × 50 = 1.000 entri per jenis. */
const MAX_PAGES = 20;

async function collect<T>(
  fetchPage: (offset: number) => Promise<{ items: T[]; total: number }>,
): Promise<T[]> {
  const all: T[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const { items, total } = await fetchPage(page * PAGE_SIZE);
    all.push(...items);
    if (items.length < PAGE_SIZE || all.length >= total) break;
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/publikasi`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/program`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/struktur`, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Bila API gagal, sitemap tetap berisi halaman utama.
  const [news, programs] = await Promise.all([
    collect((offset) => getPublicNews({ offset, limit: PAGE_SIZE })).catch(() => []),
    collect((offset) => getPublicPrograms({ offset, limit: PAGE_SIZE })).catch(() => []),
  ]);

  return [
    ...pages,
    ...news.map((item) => ({
      url: `${SITE_URL}/publikasi/${item.slug}`,
      // Tanggal saja: jam dari backend tidak membawa zona waktu.
      lastModified: item.published_at?.slice(0, 10),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...programs.map((item) => ({
      url: `${SITE_URL}/program/${item.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}