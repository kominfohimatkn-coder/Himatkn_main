import { apiFetch } from "../api/client";

import type {
  ProgramListResponse,
  PublicProgram,
} from "@/types/programs";

interface GetPublicProgramsParams {
  offset?: number;
  limit?: number;
}

interface RequestOptions {
  signal?: AbortSignal;
}

/**
 * Mengambil daftar program kerja publik.
 * Backend membatasi limit maksimal 50.
 */
export function getPublicPrograms(
  params: GetPublicProgramsParams = {},
  options: RequestOptions = {},
): Promise<ProgramListResponse<PublicProgram>> {
  const query = new URLSearchParams({
    offset: String(params.offset ?? 0),
    limit: String(params.limit ?? 20),
  });

  return apiFetch<ProgramListResponse<PublicProgram>>(
    `/public/programs?${query.toString()}`,
    {
      method: "GET",
      signal: options.signal,
    },
  );
}