import { apiFetch } from "@/lib/api/client";
import { compressImageForUpload } from "@/lib/media/compress";

import type {
  AdminNews,
  CreateNewsPayload,
  CreateNewsTagPayload,
  NewsImage,
  NewsListResponse,
  NewsStatus,
  NewsTag,
  UpdateNewsPayload,
} from "./types";

interface GetAdminNewsParams {
  offset?: number;
  limit?: number;
  status?: NewsStatus;
}

interface RequestOptions {
  signal?: AbortSignal;
}

export async function getAdminNews(
  params: GetAdminNewsParams = {},
  options: RequestOptions = {},
): Promise<NewsListResponse<AdminNews>> {
  const query = new URLSearchParams({
    offset: String(params.offset ?? 0),
    limit: String(params.limit ?? 20),
  });

  if (params.status) {
    query.set("status", params.status);
  }

  return apiFetch<NewsListResponse<AdminNews>>(
    `/admin/news?${query.toString()}`,
    { signal: options.signal },
  );
}

export function getAdminNewsByIdentifier(
  identifier: string | number,
): Promise<AdminNews> {
  return apiFetch<AdminNews>(
    `/admin/news/${encodeURIComponent(String(identifier))}`,
  );
}

export function createAdminNews(
  payload: CreateNewsPayload,
): Promise<AdminNews> {
  return apiFetch<AdminNews>("/admin/news", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminNews(
  newsId: number,
  payload: UpdateNewsPayload,
): Promise<AdminNews> {
  return apiFetch<AdminNews>(`/admin/news/${newsId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminNews(newsId: number): Promise<void> {
  return apiFetch<void>(`/admin/news/${newsId}`, {
    method: "DELETE",
  });
}

export function getAdminNewsTags(): Promise<{
  items: NewsTag[];
}> {
  return apiFetch<{ items: NewsTag[] }>("/admin/news/tags/list");
}

export function createAdminNewsTag(
  payload: CreateNewsTagPayload,
): Promise<NewsTag> {
  return apiFetch<NewsTag>("/admin/news/tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadAdminNewsImage(
  newsId: number,
  file: File,
  options: {
    caption?: string;
    sort_order?: number;
  } = {},
): Promise<NewsImage> {
  const prepared = await compressImageForUpload(file);
  const formData = new FormData();

  formData.append("file", prepared);

  if (options.caption !== undefined) {
    formData.append("caption", options.caption);
  }

  if (options.sort_order !== undefined) {
    formData.append("sort_order", String(options.sort_order));
  }

  return apiFetch<NewsImage>(`/admin/news/${newsId}/images`, {
    method: "POST",
    body: formData,
  });
}

export function updateAdminNewsImage(
  newsId: number,
  imageId: number,
  changes: {
    caption?: string;
    sort_order?: number;
  },
): Promise<NewsImage> {
  const formData = new FormData();

  if (changes.caption !== undefined) {
    formData.append("caption", changes.caption);
  }

  if (changes.sort_order !== undefined) {
    formData.append("sort_order", String(changes.sort_order));
  }

  return apiFetch<NewsImage>(`/admin/news/${newsId}/images/${imageId}`, {
    method: "PUT",
    body: formData,
  });
}

export function deleteAdminNewsImage(
  newsId: number,
  imageId: number,
): Promise<void> {
  return apiFetch<void>(`/admin/news/${newsId}/images/${imageId}`, {
    method: "DELETE",
  });
}