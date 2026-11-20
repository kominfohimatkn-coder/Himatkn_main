import { apiFetch } from "@/lib/api/client";

import { PUBLIC_SETTINGS_FALLBACK } from "./fallback";
import {
  PUBLIC_SETTING_KEYS,
  type PublicSettings,
  type PublicSettingsResponse,
} from "./types";

export { PUBLIC_SETTINGS_FALLBACK };

interface RequestOptions {
  signal?: AbortSignal;
}

/**
 * Selaras dengan `Cache-Control: public, max-age=60` pada
 * `GET /public/settings`. `next.revalidate` dipakai (bukan `cache: no-store`)
 * agar Server Component dapat memakai cache Next.js selama 60 detik.
 */
const PUBLIC_SETTINGS_REVALIDATE_SECONDS = 60;

/**
 * Mengambil nilai setting publik efektif dari backend.
 */
export function getPublicSettings(
  options: RequestOptions = {},
): Promise<PublicSettings> {
  return apiFetch<PublicSettingsResponse>("/public/settings", {
    method: "GET",
    signal: options.signal,
    next: { revalidate: PUBLIC_SETTINGS_REVALIDATE_SECONDS },
  }).then((response) => response.settings);
}

export interface PublicSettingsLoadResult {
  data: PublicSettings | null;
  hasError: boolean;
}

/**
 * Memuat setting untuk Server Component dengan batas waktu eksplisit.
 * `data: null` + `hasError: true` berarti request gagal/timeout; pemanggil
 * sebaiknya memakai `resolvePublicSettings()` agar nilai fallback terpakai.
 */
export async function loadPublicSettings(): Promise<PublicSettingsLoadResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const data = await getPublicSettings({
      signal: controller.signal,
    });

    return {
      data,
      hasError: false,
    };
  } catch {
    return {
      data: null,
      hasError: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Menggabungkan hasil load dengan fallback per key.
 *
 * Nilai non-kosong dari backend menang. Nilai kosong dari backend tetap kosong
 * untuk key data (URL, email, alamat, footer, gambar) karena fallback key itu
 * juga `""`; key copy yang punya default non-kosong kembali ke default agar
 * halaman tidak kehilangan judul/label saat admin mengosongkannya.
 */
export function resolvePublicSettings(
  result: PublicSettingsLoadResult,
): PublicSettings {
  const resolved: PublicSettings = { ...PUBLIC_SETTINGS_FALLBACK };

  if (!result.data) {
    return resolved;
  }

  for (const key of PUBLIC_SETTING_KEYS) {
    const value = result.data[key];

    if (typeof value === "string" && value.trim() !== "") {
      resolved[key] = value;
    }
  }

  return resolved;
}
