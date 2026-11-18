import { ApiError } from "@/lib/api/errors";

/**
 * Mengambil pesan yang aman ditampilkan dari error API.
 *
 * Backend mengirim pesan yang spesifik (termasuk konflik `409` seperti
 * "Periode tidak bisa dihapus: masih ada 9 divisi, 57 anggota, 1 program
 * kerja"), jadi `detail` selalu diprioritaskan di atas pesan generik.
 */
export function getOrganizationErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof ApiError && error.detail.trim()) {
    return error.detail;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
