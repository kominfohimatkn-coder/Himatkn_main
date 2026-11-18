import { apiFetch } from "../api/client";

import type {
  AdminAccount,
  AdminAccountCreatePayload,
  AdminAccountListResponse,
  AdminAccountUpdatePayload,
  PermissionCatalogResponse,
} from "@/types/admin-accounts";

interface RequestOptions {
  signal?: AbortSignal;
}

export function getAdminAccounts(
  options: RequestOptions = {},
): Promise<AdminAccountListResponse> {
  return apiFetch<AdminAccountListResponse>("/admin/admins", {
    method: "GET",
    signal: options.signal,
  });
}

export function getAdminPermissionCatalog(
  options: RequestOptions = {},
): Promise<PermissionCatalogResponse> {
  return apiFetch<PermissionCatalogResponse>("/admin/admins/permissions", {
    method: "GET",
    signal: options.signal,
  });
}

export function createAdminAccount(
  payload: AdminAccountCreatePayload,
): Promise<AdminAccount> {
  return apiFetch<AdminAccount>("/admin/admins", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminAccount(
  adminId: number,
  payload: AdminAccountUpdatePayload,
): Promise<AdminAccount> {
  return apiFetch<AdminAccount>(`/admin/admins/${adminId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminAccount(adminId: number): Promise<void> {
  return apiFetch<void>(`/admin/admins/${adminId}`, {
    method: "DELETE",
  });
}

/**
 * Menambahkan izin turunan (`implies`) secara transitif ke daftar pilihan.
 *
 * Helper murni untuk form centang: tidak memanggil API dan tidak menambahkan
 * `superadmin_only` maupun `always_granted`. Hasil diurutkan agar state form
 * stabil.
 */
export function applyPermissionImplications(
  selected: readonly string[],
  catalog: PermissionCatalogResponse,
): string[] {
  const implications = new Map<string, readonly string[]>();

  for (const catalogModule of catalog.items) {
    for (const permission of catalogModule.permissions) {
      implications.set(permission.name, permission.implies);
    }
  }

  const expanded = new Set(selected);
  const pending = [...expanded];

  while (pending.length > 0) {
    const current = pending.pop();

    if (current === undefined) {
      continue;
    }

    for (const implied of implications.get(current) ?? []) {
      if (!expanded.has(implied)) {
        expanded.add(implied);
        pending.push(implied);
      }
    }
  }

  return [...expanded].sort();
}
