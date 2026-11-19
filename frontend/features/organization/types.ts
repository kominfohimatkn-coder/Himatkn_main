export interface AdminPeriod {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

export interface AdminDivision {
  id: number;
  period_id: number;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface PublicOrganizationPeriod {
  id: number;
  name: string;
}

export interface PublicOrganizationDivision {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface PublicOrganizationPosition {
  id: number;
  name: string;
  sort_order: number;
}

export interface PublicOrganizationMember {
  id: number;
  name: string;
  division_id: number | null;
  position_id: number;
  photo_url: string | null;
}

export interface PublicOrganizationResponse {
  period: PublicOrganizationPeriod | null;
  divisions: PublicOrganizationDivision[];
  members: PublicOrganizationMember[];
  positions: PublicOrganizationPosition[];
}

export interface OrganizationListResponse<T> {
  items: T[];
}

/** Filter list divisi/anggota yang didukung backend. */
export interface OrganizationListFilter {
  period_id?: number;
}

export interface PeriodCreatePayload {
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}

/**
 * `PUT /periods/{id}` mengganti nama dan tanggal; `is_active` tidak dapat
 * diubah lewat endpoint ini.
 */
export interface PeriodUpdatePayload {
  name: string;
  start_date: string | null;
  end_date: string | null;
}

export interface PeriodActivateResponse {
  period: AdminPeriod;
  warnings: string[];
}

export interface PeriodDeleteResponse {
  deleted: number;
}

export interface DivisionCreatePayload {
  period_id: number;
  name: string;
  description?: string | null;
  sort_order?: number;
}

/** `PUT /divisions/{id}` tidak menerima `period_id`. */
export interface DivisionUpdatePayload {
  name: string;
  description: string | null;
  sort_order: number;
}

export interface DivisionCopyPayload {
  source_period_id: number;
}

export interface DivisionCopyResponse {
  created: AdminDivision[];
  skipped: string[];
}

export interface DivisionDeleteResponse {
  deleted: number;
}

export interface AdminPosition {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface AdminMember {
  id: number;
  period_id: number;
  division_id: number | null;
  position_id: number;
  name: string;
  photo_url: string | null;
  sort_order: number;
}

export interface MemberCreatePayload {
  period_id: number;
  division_id?: number | null;
  position_id: number;
  name: string;
  photo_url?: string | null;
  sort_order?: number;
}

/** `PUT /members/{id}` mengganti seluruh field anggota. */
export interface MemberUpdatePayload {
  period_id: number;
  division_id: number | null;
  position_id: number;
  name: string;
  photo_url: string | null;
  sort_order: number;
}
