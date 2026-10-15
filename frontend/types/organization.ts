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

export interface OrganizationListResponse<T> {
  items: T[];
}