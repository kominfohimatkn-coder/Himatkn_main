import { apiFetch } from "@/lib/api/client";

import type {
  ActivityAdminOption,
  ActivityLogFilters,
  ActivityLogListResponse,
} from "./types";

interface RequestOptions {
  signal?: AbortSignal;
}

export function getActivityLogs(
  filters: ActivityLogFilters = {},
  options: RequestOptions = {},
): Promise<ActivityLogListResponse> {
  const query = new URLSearchParams({
    offset: String(filters.offset ?? 0),
    limit: String(filters.limit ?? 20),
  });

  const q = filters.q?.trim();
  if (q) query.set("q", q);
  if (filters.kind) query.set("kind", filters.kind);
  if (filters.adminId) query.set("admin_id", String(filters.adminId));

  return apiFetch<ActivityLogListResponse>(`/admin/activity-logs?${query.toString()}`, {
    method: "GET",
    signal: options.signal,
  });
}

/** Administrator yang punya catatan, untuk filter "Semua admin". */
export function getActivityAdmins(
  options: RequestOptions = {},
): Promise<{ items: ActivityAdminOption[] }> {
  return apiFetch<{ items: ActivityAdminOption[] }>("/admin/activity-logs/admins", {
    method: "GET",
    signal: options.signal,
  });
}