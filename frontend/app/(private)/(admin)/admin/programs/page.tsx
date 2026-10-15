import { apiFetch } from "../api/client"

import type {
  AdminProgram,
  CreateProgramPayload,
  ProgramListResponse,
  UpdateProgramPayload,
} from "@/types/programs";

interface GetAdminProgramsParams {
  offset?: number;
  limit?: number;
}

interface RequestOptions {
  signal?: AbortSignal;
}

/**
 * Mengambil daftar program kerja administrator.
 * Backend membatasi limit maksimal 100.
 */
export function getAdminPrograms(
  params: GetAdminProgramsParams = {},
  options: RequestOptions = {},
): Promise<ProgramListResponse<AdminProgram>> {
  const query = new URLSearchParams({
    offset: String(params.offset ?? 0),
    limit: String(params.limit ?? 20),
  });

  return apiFetch<ProgramListResponse<AdminProgram>>(
    `/admin/programs?${query.toString()}`,
    {
      method: "GET",
      signal: options.signal,
    },
  );
}

/**
 * Membuat program kerja baru.
 */
export function createAdminProgram(
  payload: CreateProgramPayload,
): Promise<AdminProgram> {
  return apiFetch<AdminProgram>("/admin/programs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Memperbarui program kerja.
 * Payload mengikuti schema ProgramIn pada backend.
 */
export function updateAdminProgram(
  programId: number,
  payload: UpdateProgramPayload,
): Promise<AdminProgram> {
  return apiFetch<AdminProgram>(
    `/admin/programs/${programId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Menghapus program kerja.
 * Backend mengembalikan HTTP 204.
 */
export function deleteAdminProgram(
  programId: number,
): Promise<void> {
  return apiFetch<void>(`/admin/programs/${programId}`, {
    method: "DELETE",
  });
}