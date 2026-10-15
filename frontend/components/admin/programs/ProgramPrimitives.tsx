const STATUS_LABELS: Record<string, string> = {
  planned: "Direncanakan",
  ongoing: "Berjalan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_COLORS: Record<string, string> = {
  planned: "border-gold/40 bg-gold/15 text-ink",
  ongoing: "border-blue-200 bg-blue-50 text-blue-800",
  completed: "border-green-200 bg-green-50 text-green-800",
  cancelled: "border-paper-line bg-bg-light-2 text-ink-soft",
};

export function ProgramStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus = status.trim().toLowerCase();

  const label =
    STATUS_LABELS[normalizedStatus] ??
    status.replace(/[_-]/g, " ");

  const color =
    STATUS_COLORS[normalizedStatus] ??
    "border-paper-line bg-bg-light-2 text-ink-soft";

  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-xs font-medium ${color}`}
    >
      {label || "Tidak diketahui"}
    </span>
  );
}

export function formatProgramDate(
  value: string | null | undefined,
): string {
  if (!value) return "Belum ditentukan";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak valid";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}