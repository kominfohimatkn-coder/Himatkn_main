import { apiFetch } from "@/lib/api/client";
import { compressImageForUpload } from "./compress";
import type { UploadImageResponse } from "./types";

export type { UploadImageResponse };

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") ?? "";

const API_ORIGIN = (() => {
  if (!API_URL) return "";

  try {
    return new URL(API_URL).origin;
  } catch {
    return "";
  }
})();

const MEDIA_IMAGE_PREFIX = "/api/v1/media/images/";

/**
 * Mengubah storage key gambar V2 (mis. `images/abc.jpg`) menjadi path media
 * (`/api/v1/media/images/abc.jpg`), selaras dengan `media_image_path` backend.
 */
export function mediaPathFromStorageKey(
  storageKey: string | null | undefined,
): string | null {
  if (!storageKey) return null;

  const key = storageKey.trim().replace(/^\/+/, "");
  if (!key) return null;

  if (key.startsWith("api/v1/media/")) {
    return `/${key}`;
  }

  if (key.startsWith("images/")) {
    return `/api/v1/media/${key}`;
  }

  return `${MEDIA_IMAGE_PREFIX}${key}`;
}

/**
 * Backend mengembalikan URL media relatif (mis. `/api/v1/media/...`).
 * Resolver ini mengubahnya menjadi URL absolut tanpa mengubah path kontrak.
 */
export function resolveMediaUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;

  const url = value.trim();

  if (!url) return null;

  if (
    /^(https?:)?\/\//i.test(url) ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return API_ORIGIN ? `${API_ORIGIN}${url}` : null;
  }

  return API_URL ? `${API_URL}/${url.replace(/^\/+/, "")}` : null;
}

/**
 * Mengunggah gambar ke `POST /media/images` (otomatis mengompres jika perlu).
 */
export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const prepared = await compressImageForUpload(file);
  const formData = new FormData();
  formData.append("file", prepared);

  return apiFetch<UploadImageResponse>("/media/images", {
    method: "POST",
    body: formData,
  });
}
