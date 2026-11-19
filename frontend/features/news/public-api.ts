import { apiFetch } from "@/lib/api/client";
import { isNotFound } from "@/lib/api/errors";

import type {
  PublicNewsDetail,
  PublicNewsListResponse,
} from "./types";

interface GetPublicNewsParams {
  offset?: number;
  limit?: number;
  /** Pencarian judul; hanya dikirim bila minimal 2 karakter setelah trim. */
  q?: string;
  signal?: AbortSignal;
}

interface RequestOptions {
  signal?: AbortSignal;
}

/**
 * Mengambil daftar publikasi publik.
 * Backend membatasi limit maksimal 50 dan mengirim `total` serta `excerpt`
 * dan `tags` per item (API-B2).
 */
export function getPublicNews(
  params: GetPublicNewsParams = {},
): Promise<PublicNewsListResponse> {
  const query = new URLSearchParams({
    offset: String(params.offset ?? 0),
    limit: String(params.limit ?? 20),
  });

  const term = params.q?.trim();

  if (term && term.length >= 2) {
    query.set("q", term);
  }

  return apiFetch<PublicNewsListResponse>(
    `/public/news?${query.toString()}`,
    {
      cache: "no-store",
      signal: params.signal,
    },
  );
}

/**
 * Mengambil detail publikasi. `null` hanya untuk 404; error lain dilempar.
 */
export async function getPublicNewsBySlug(
  slug: string,
  options: RequestOptions = {},
): Promise<PublicNewsDetail | null> {
  try {
    return await apiFetch<PublicNewsDetail>(
      `/public/news/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        signal: options.signal,
      },
    );
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }

    throw error;
  }
}
