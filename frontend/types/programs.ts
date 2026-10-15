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

export interface PublicProgram {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export interface ProgramListResponse<T> {
  items: T[];
  offset: number;
  limit: number;
}

export interface ProgramInput {
  period_id: number;
  division_id?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
}

export type CreateProgramPayload = ProgramInput;

/**
 * Endpoint PUT backend menerima ProgramInput lengkap,
 * bukan payload parsial.
 */
export type UpdateProgramPayload = ProgramInput;