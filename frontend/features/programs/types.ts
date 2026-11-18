export const PROGRAM_STATUSES = [
  "planned",
  "ongoing",
  "completed",
  "cancelled",
] as const;

export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export interface AdminProgram {
  id: number;
  period_id: number;
  division_id: number | null;
  created_by: number | null;
  name: string;
  slug: string;
  description: string | null;
  /**
   * Data lama belum tentu memakai nilai enum resmi, jadi tipe admin tetap
   * `string` dan dinormalisasi lewat helper status.
   */
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicProgramDivision {
  id: number;
  name: string;
}

export interface PublicProgramPeriod {
  id: number;
  name: string;
}

export interface PublicProgram {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: ProgramStatus;
  start_date: string | null;
  end_date: string | null;
  division: PublicProgramDivision | null;
  period: PublicProgramPeriod;
}

export interface PublicProgramListResponse {
  items: PublicProgram[];
  total: number;
  offset: number;
  limit: number;
  period: PublicProgramPeriod | null;
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
  status: ProgramStatus;
  start_date?: string | null;
  end_date?: string | null;
}

export type CreateProgramPayload = ProgramInput;

/**
 * Endpoint PUT backend menerima ProgramInput lengkap,
 * bukan payload parsial.
 */
export type UpdateProgramPayload = ProgramInput;
