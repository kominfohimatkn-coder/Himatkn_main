import { apiFetch } from "@/lib/api/client";
import { isNotFound } from "@/lib/api/errors";

import type {
  ProgramStatus,
  PublicProgram,
  PublicProgramListResponse,
} from "./types";

interface GetPublicProgramsParams {
  offset?: number;
  limit?: number;
  /** Default backend: periode aktif. */
  periodId?: number;
  /** Satu nilai atau beberapa nilai; diserialisasi sebagai parameter berulang. */
  status?: ProgramStatus | ProgramStatus[];
  divisionId?: number;
  signal?: AbortSignal;
}

interface RequestOptions {
  signal?: AbortSignal;
}

/**
 * Mengambil daftar program kerja publik.
 *
 * Backend membatasi limit maksimal 50, hanya mengirim program dari periode
 * yang dipakai, dan menerima `status` berulang atau dipisah koma. Service ini
 * memakai parameter berulang agar tidak perlu mengurus escaping koma.
 */
export function getPublicPrograms(
  params: GetPublicProgramsParams = {},
  options: RequestOptions = {},
): Promise<PublicProgramListResponse> {
  const query = new URLSearchParams({
    offset: String(params.offset ?? 0),
    limit: String(params.limit ?? 20),
  });

  if (params.periodId !== undefined) {
    query.set("period_id", String(params.periodId));
  }

  if (params.divisionId !== undefined) {
    query.set("division_id", String(params.divisionId));
  }

  const statuses = params.status
    ? Array.isArray(params.status)
      ? params.status
      : [params.status]
    : [];

  for (const status of new Set(statuses)) {
    query.append("status", status);
  }

  return apiFetch<PublicProgramListResponse>(
    `/public/programs?${query.toString()}`,
    {
      method: "GET",
      signal: params.signal ?? options.signal,
    },
  );
}

/**
 * Mengambil detail program berdasarkan slug. Detail boleh berasal dari
 * periode mana pun. `null` hanya untuk 404; error lain dilempar.
 */
export async function getPublicProgramBySlug(
  slug: string,
  options: RequestOptions = {},
): Promise<PublicProgram | null> {
  try {
    return await apiFetch<PublicProgram>(
      `/public/programs/${encodeURIComponent(slug)}`,
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
