/**
 * Format tanggal mengikuti prototype `Design/assets/app.js` (`fmt`):
 * `7 Mar 2026`. Tanggal dari API berbentuk `YYYY-MM-DD`; `T00:00:00`
 * dipakai supaya tidak bergeser karena zona waktu.
 */
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const LONG_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function parseDate(value: string | null): Date | null {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

/** Contoh: `7 Mar 2026`. */
export function formatDateShort(value: string | null): string | null {
  const date = parseDate(value);
  if (!date) return null;

  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Contoh: `7 Maret 2026`. */
export function formatDateLong(value: string | null): string | null {
  const date = parseDate(value);
  if (!date) return null;

  return `${date.getDate()} ${LONG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Rentang tanggal program; hanya bagian yang tersedia yang ditampilkan.
 * Contoh: `7 Mar 2026 – 9 Mar 2026`.
 */
export function formatDateRange(
  start: string | null,
  end: string | null,
): string | null {
  const startLabel = formatDateShort(start);
  const endLabel = formatDateShort(end);

  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  if (startLabel) return `Mulai ${startLabel}`;
  if (endLabel) return `Selesai ${endLabel}`;

  return null;
}
