import { apiFetch } from "../api/client";

import type {
  NewsListResponse,
  PublicNewsDetail,
  PublicNewsItem,
} from "@/types/news";

interface GetPublicNewsParams {
  offset?: number;
  limit?: number;
  signal?: AbortSignal;
}

export function getPublicNews(
  params: GetPublicNewsParams = {},
): Promise<NewsListResponse<PublicNewsItem>> {
  const query = new URLSearchParams({
    offset: String(params.offset ?? 0),
    limit: String(params.limit ?? 20),
  });

  return apiFetch<NewsListResponse<PublicNewsItem>>(
    `/public/news?${query.toString()}`,
    {
      cache: "no-store",
      signal: params.signal,
    },
  );
}

export function getPublicNewsBySlug(
  slug: string,
): Promise<PublicNewsDetail> {
  return apiFetch<PublicNewsDetail>(
    `/public/news/${encodeURIComponent(slug)}`,
  );
}
