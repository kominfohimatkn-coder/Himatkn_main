import { apiFetch } from "../api/client";

import type {
  AdminSettingUpdateResponse,
  AdminSettingsDeleteResponse,
  AdminSettingsPatchResponse,
  AdminSettingsResponse,
} from "@/types/settings";

interface RequestOptions {
  signal?: AbortSignal;
}

export function getAdminSettings(
  options: RequestOptions = {},
): Promise<AdminSettingsResponse> {
  return apiFetch<AdminSettingsResponse>("/admin/settings", {
    method: "GET",
    signal: options.signal,
  });
}

/**
 * Menyimpan satu setting. `apiFetch` menambahkan header CSRF otomatis untuk
 * request non-GET.
 */
export function updateAdminSetting(
  key: string,
  value: string | null,
): Promise<AdminSettingUpdateResponse> {
  return apiFetch<AdminSettingUpdateResponse>(
    `/admin/settings/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      body: JSON.stringify({ setting_value: value }),
    },
  );
}

/**
 * Menyimpan banyak setting sekaligus. Error validasi 422 tersedia lewat
 * `ApiError.errors` (key → pesan).
 */
export function patchAdminSettings(
  values: Record<string, string>,
): Promise<AdminSettingsPatchResponse> {
  return apiFetch<AdminSettingsPatchResponse>("/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({ values }),
  });
}

export function deleteAdminSetting(
  key: string,
): Promise<AdminSettingsDeleteResponse> {
  return apiFetch<AdminSettingsDeleteResponse>(
    `/admin/settings/${encodeURIComponent(key)}`,
    {
      method: "DELETE",
    },
  );
}
