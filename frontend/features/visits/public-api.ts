import { apiFetch } from "@/lib/api/client";

/**
 * Mencatat kunjungan halaman publik.
 *
 * Semua kegagalan (jaringan, 429 rate limit, CSRF, dan sebagainya) ditelan
 * diam-diam agar analytics tidak pernah mengganggu UI. Fungsi ini belum
 * dipasang ke halaman mana pun pada batch API-F.
 */
export async function recordVisit(page: string): Promise<void> {
  const query = new URLSearchParams({ page });

  try {
    await apiFetch<void>(`/public/visits?${query.toString()}`, {
      method: "POST",
      cache: "no-store",
    });
  } catch {
    // Sengaja diabaikan: kegagalan pencatatan kunjungan bukan error UI.
  }
}
