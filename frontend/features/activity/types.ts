/** Jenis aksi, dihitung backend dari nama aksi (`news.create` → `create`). */
export type ActivityKind = "create" | "update" | "delete" | "auth";

export interface ActivityLog {
  id: number;
  admin_id: number | null;
  /** `null` bila akun sudah dihapus atau percobaan login tanpa akun. */
  admin_username: string | null;
  /** Mis. `news.update`, `auth.login.failure`. */
  action: string;
  kind: ActivityKind;
  entity_type: string | null;
  entity_id: number | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  /** UTC tanpa zona waktu, mis. `2026-11-24T08:19:00`. */
  created_at: string;
}

export type ActivityCounts = Record<ActivityKind | "all", number>;

export interface ActivityLogListResponse {
  items: ActivityLog[];
  offset: number;
  limit: number;
  total: number;
  counts: ActivityCounts;
}

export interface ActivityLogFilters {
  q?: string;
  kind?: ActivityKind;
  adminId?: number;
  offset?: number;
  limit?: number;
}

export interface ActivityAdminOption {
  id: number;
  username: string;
}