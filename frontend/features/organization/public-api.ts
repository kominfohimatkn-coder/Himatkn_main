import { apiFetch } from "@/lib/api/client";

import type { PublicOrganizationResponse } from "./types";

interface RequestOptions {
  signal?: AbortSignal;
}

/**
 * Mengambil periode aktif beserta divisi, anggota, dan jabatan publik.
 * Endpoint ini terpisah dari berita agar kegagalan salah satu tidak
 * menjatuhkan seluruh beranda.
 */
export function getPublicOrganization(
  options: RequestOptions = {},
): Promise<PublicOrganizationResponse> {
  return apiFetch<PublicOrganizationResponse>("/public/organization", {
    method: "GET",
    cache: "no-store",
    signal: options.signal,
  });
}

export type PublicOrganizationLoadResult = {
  data: PublicOrganizationResponse | null;
  hasError: boolean;
};

/**
 * Memuat organisasi untuk Server Component dengan batas waktu eksplisit.
 * Hasil null + hasError false berarti request berhasil tetapi tidak ada
 * periode aktif; hasil null + hasError true berarti request gagal/timeout.
 */
export async function loadPublicOrganization(): Promise<PublicOrganizationLoadResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const data = await getPublicOrganization({
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
