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
}

export interface PublicOrganizationPosition {
  id: number;
  name: string;
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
