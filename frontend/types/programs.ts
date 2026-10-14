export interface AdminProgram {
  id: number;
  period_id: number;
  division_id: number | null;
  created_by: number | null;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}