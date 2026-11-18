import {
  PROGRAM_STATUSES,
  type ProgramStatus,
} from "./types";

const PROGRAM_STATUS_LABELS: Record<ProgramStatus, string> = {
  planned: "Direncanakan",
  ongoing: "Berjalan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export function isProgramStatus(
  value: unknown,
): value is ProgramStatus {
  return (
    typeof value === "string" &&
    (PROGRAM_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Menormalkan nilai status dari backend/DB. Nilai di luar empat status resmi
 * (termasuk data lama) menjadi `null`.
 */
export function normalizeProgramStatus(
  value: unknown,
): ProgramStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return isProgramStatus(normalized) ? normalized : null;
}

/**
 * Label tampilan untuk status program. Nilai tak dikenal tidak pernah
 * membuat UI crash dan memakai label netral.
 */
export function programStatusLabel(value: unknown): string {
  const normalized = normalizeProgramStatus(value);

  return normalized
    ? PROGRAM_STATUS_LABELS[normalized]
    : "Status lain";
}
