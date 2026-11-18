/**
 * Akun administrator seperti yang dikirim `GET /admin/admins`.
 *
 * `permissions` berisi izin efektif (implikasi sudah diterapkan); `roles`
 * berisi `["superadmin"]` untuk superadmin dan `[]` untuk akun lain.
 */
export interface AdminAccount {
  id: number;
  username: string;
  is_active: boolean;
  is_superadmin: boolean;
  roles: string[];
  permissions: string[];
  last_login_at: string | null;
}

export interface AdminAccountListResponse {
  items: AdminAccount[];
}

export interface PermissionCatalogEntry {
  name: string;
  label: string;
  implies: string[];
}

export interface PermissionCatalogModule {
  key: string;
  label: string;
  /** `false` berarti modul belum tersedia dan centang ditampilkan nonaktif. */
  available: boolean;
  permissions: PermissionCatalogEntry[];
}

/**
 * Respons `GET /admin/admins/permissions`.
 *
 * Izin superadmin-only tidak muncul di `items`; frontend cukup memakai
 * sakelar `is_superadmin`.
 */
export interface PermissionCatalogResponse {
  items: PermissionCatalogModule[];
  superadmin_only: string[];
  always_granted: string[];
}

export interface AdminAccountCreatePayload {
  username: string;
  password: string;
  is_superadmin?: boolean;
  /**
   * Opsional. Bila tidak dikirim, akun hanya mendapat `dashboard.view`.
   * Wajib kosong bila `is_superadmin` bernilai `true`.
   */
  permissions?: string[];
}

/**
 * Payload `PUT /admin/admins/{id}`. Semua field opsional; hanya field yang
 * dikirim yang diubah. `permissions` menggantikan seluruh izin langsung.
 */
export interface AdminAccountUpdatePayload {
  username?: string;
  password?: string;
  is_active?: boolean;
  is_superadmin?: boolean;
  permissions?: string[];
}
