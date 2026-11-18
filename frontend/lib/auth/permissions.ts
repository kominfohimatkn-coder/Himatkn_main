import type { Admin } from "@/types/auth";

/**
 * Nama izin yang dikenal backend.
 *
 * Sumber: `Backend/app/services/permissions.py` (`PERMISSION_CATALOG` dan
 * `SUPERADMIN_ONLY`). Jangan menulis string izin manual di halaman; pakai
 * konstanta ini agar perubahan kontrak terdeteksi di satu tempat.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  NEWS_VIEW: "news.view",
  NEWS_CREATE: "news.create",
  NEWS_UPDATE: "news.update",
  NEWS_DELETE: "news.delete",
  PROGRAMS_VIEW: "programs.view",
  PROGRAMS_MANAGE: "programs.manage",
  ORGANIZATION_VIEW: "organization.view",
  ORGANIZATION_MANAGE: "organization.manage",
  SETTINGS_VIEW: "settings.view",
  SETTINGS_MANAGE: "settings.manage",
  MEDIA_MANAGE: "media.manage",
  ACTIVITY_LOGS_VIEW: "activity_logs.view",
  VISITOR_LOGS_VIEW: "visitor_logs.view",
  AGENDAS_VIEW: "agendas.view",
  AGENDAS_MANAGE: "agendas.manage",
  DOCUMENTS_VIEW: "documents.view",
  DOCUMENTS_MANAGE: "documents.manage",
  NOTIFICATIONS_VIEW: "notifications.view",
  NOTIFICATIONS_MANAGE: "notifications.manage",
  ADMINS_VIEW: "admins.view",
  ADMINS_MANAGE: "admins.manage",
  ROLES_MANAGE: "roles.manage",
} as const;

export type PermissionName =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Memeriksa satu izin pada admin aktif.
 *
 * Admin `null` atau nonaktif tidak memiliki izin apa pun. Superadmin tidak
 * diberi pengecualian khusus karena backend sudah mengirim seluruh izin pada
 * daftar `permissions` miliknya.
 */
export function hasPermission(
  admin: Admin | null | undefined,
  name: string,
): boolean {
  if (!admin || !admin.is_active) {
    return false;
  }

  return admin.permissions.includes(name);
}

/**
 * Memeriksa apakah admin memiliki salah satu dari daftar izin.
 */
export function hasAnyPermission(
  admin: Admin | null | undefined,
  names: readonly string[],
): boolean {
  if (!admin || !admin.is_active) {
    return false;
  }

  return names.some((name) => admin.permissions.includes(name));
}
